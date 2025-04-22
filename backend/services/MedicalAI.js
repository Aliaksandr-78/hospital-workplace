const natural = require('natural');
const { DecisionTreeClassifier } = require('ml-cart');
const levenary = require('levenary');
const { pool } = require('../config/db');

class MedicalAI {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.decisionTree = null;
    this.similarityEngine = new PatientSimilarityEngine();
    this.medications = new Map();
    this.diagnoses = new Map();
  }

  async initialize() {
    console.log('🔄 Инициализация медицинского ИИ...');
    try {
      await this._loadData();
      await this._trainModels();
      console.log('✅ Медицинский ИИ готов к работе');
    } catch (err) {
      console.error('❌ Ошибка инициализации MedicalAI:', err.message);
      throw err;
    }
  }

  async _loadData() {
    try {
      // Загрузка диагнозов
      const { rows: diagnoses } = await pool.query('SELECT * FROM diagnoses');
      console.log(`Загружено диагнозов: ${diagnoses.length}`);
      
      if (diagnoses.length === 0) {
        console.warn('В базе данных нет диагнозов!');
      }
      
      diagnoses.forEach(d => {
        console.log(`Диагноз ID: ${d.diagnosisid}, Название: ${d.name}`);
        this.diagnoses.set(d.diagnosisid, d);
      });
    } catch (err) {
      console.error('Ошибка загрузки диагнозов:', err);
      throw err;
    }
  }

  async _trainModels() {
    await this._trainBayesClassifier();
    await this._trainDecisionTree();
    await this.similarityEngine.initialize();
  }

  async _trainBayesClassifier() {
    try {
      // Упрощенный запрос без фильтрации по дате
      const { rows } = await pool.query(`
        SELECT d.name as diagnosis, m.name as medication 
        FROM prescriptions p
        JOIN medicalrecords mr ON p.patientid = mr.patientid
        JOIN medicalrecordentries mre ON mr.recordid = mre.recordid
        JOIN diagnoses d ON mre.diagnosisid = d.diagnosisid
        JOIN medications m ON p.medicationid = m.medicationid
        LIMIT 1000
      `);

      if (rows.length === 0) {
        console.log('⚠️ Нет данных для обучения классификатора');
        return;
      }

      // Балансировка данных
      const medCounts = {};
      rows.forEach(row => {
        medCounts[row.medication] = (medCounts[row.medication] || 0) + 1;
      });

      const balancedData = [];
      const maxSamples = Math.max(...Object.values(medCounts));
      
      Object.keys(medCounts).forEach(med => {
        const samples = rows.filter(r => r.medication === med);
        const ratio = Math.floor(maxSamples / samples.length);
        balancedData.push(...Array(ratio).fill().flatMap(() => samples));
      });

      balancedData.forEach(row => {
        this.classifier.addDocument(
          this._normalizeText(row.diagnosis), 
          row.medication
        );
      });

      this.classifier.train();
      console.log(`📚 Байесовский классификатор обучен на ${balancedData.length} случаях`);
    } catch (err) {
      console.error('Ошибка обучения классификатора:', err);
      throw err;
    }
  }

  async _trainDecisionTree() {
    try {
      const { rows } = await pool.query(`
        SELECT 
          mre.diagnosisid,
          pf.featurevalue,
          p.medicationid
        FROM prescriptions p
        JOIN medicalrecords mr ON p.patientid = mr.patientid
        JOIN medicalrecordentries mre ON mr.recordid = mre.recordid
        JOIN diagnoses d ON mre.diagnosisid = d.diagnosisid
        LEFT JOIN patientfeatures pf ON p.patientid = pf.patientid
        WHERE pf.featuretype IN ('заболевание', 'аллергия')
        LIMIT 1000
      `);

      if (rows.length === 0) {
        console.log('⚠️ Нет данных для обучения дерева решений');
        return;
      }

      const features = rows.map(row => [
        row.diagnosisid,
        row.featurevalue ? this._hashFeature(row.featurevalue) : 0
      ]);

      const labels = rows.map(row => row.medicationid);

      this.decisionTree = new DecisionTreeClassifier({
        gainFunction: 'gini',
        maxDepth: 8
      });

      this.decisionTree.train(features, labels);
      console.log('🌳 Дерево решений построено');
    } catch (err) {
      console.error('Ошибка обучения дерева решений:', err);
      throw err;
    }
  }

  async getRecommendations(diagnosisId, patientId = null) {
    try {
      const id = Number(diagnosisId);
  
      if (!this.diagnoses.has(id)) {
        console.error(`Диагноз с ID ${id} не найден. Доступные диагнозы:`, 
          Array.from(this.diagnoses.keys()));
        throw new Error('Диагноз не найден');
      };

      const diagnosis = this.diagnoses.get(id);
      // Добавим проверку на наличие данных для моделей
      const hasBayesData = this.classifier.getClassifications(diagnosis.name).length > 0;
      const hasDecisionTreeData = this.decisionTree !== null;
  
      const [protocolRecs, bayesRecs, dtRecs, similarRecs] = await Promise.all([
        this._getProtocolRecs(diagnosisId),
        hasBayesData ? this._getBayesRecs(diagnosis.name) : [],
        (patientId && hasDecisionTreeData) ? this._getDecisionTreeRecs(diagnosisId, patientId) : [],
        patientId ? this.similarityEngine.getSimilarRecs(patientId) : []
      ]);
  
      // Остальной код без изменений
      const combined = this._combineRecommendations(protocolRecs, bayesRecs, dtRecs, similarRecs);
      const filtered = patientId ? 
        await this._filterContraindications(combined, patientId) : 
        combined;
  
      return {
        diagnosis: diagnosis.name,
        recommendations: filtered.slice(0, 10),
        modelMetrics: {
          protocol: protocolRecs.length,
          bayes: bayesRecs.length,
          decisionTree: dtRecs.length,
          similarPatients: similarRecs.length
        }
      };
    } catch (err) {
      console.error('Ошибка получения рекомендаций:', err);
      throw err;
    }
  }

  async _getProtocolRecs(diagnosisId) {
    const { rows } = await pool.query(`
      SELECT m.medicationid, m.name, dm.isfirstline, dm.confidence
      FROM diagnosismedication dm
      JOIN medications m ON dm.medicationid = m.medicationid
      WHERE dm.diagnosisid = $1
      ORDER BY dm.isfirstline DESC, dm.confidence DESC
    `, [diagnosisId]);

    return rows.map(r => ({
      MedicationID: r.medicationid,
      name: r.name,
      confidence: r.confidence,
      isFirstLine: r.isfirstline,
      source: 'protocol',
      weight: r.isfirstline ? 0.9 : 0.7
    }));
  }

  async _getBayesRecs(diagnosisText) {
    const classifications = this.classifier.getClassifications(
      this._normalizeText(diagnosisText)
    );

    return classifications
      .filter(c => c.value > 0.2)
      .map(c => ({
        MedicationID: this._findMedicationId(c.label),
        name: c.label,
        confidence: c.value,
        source: 'bayes',
        weight: 0.7
      }));
  }

  async _getDecisionTreeRecs(diagnosisId, patientId) {
    const { rows: features } = await pool.query(`
      SELECT featurevalue FROM patientfeatures 
      WHERE patientid = $1 AND featuretype IN ('заболевание', 'аллергия')
    `, [patientId]);

    const input = [
      diagnosisId,
      features[0] ? this._hashFeature(features[0].featurevalue) : 0
    ];

    const prediction = this.decisionTree.predict([input]);
    const med = this.medications.get(prediction[0]);

    return med ? [{
      MedicationID: med.medicationid,
      name: med.name,
      confidence: 0.8,
      source: 'decision_tree',
      weight: 0.6
    }] : [];
  }

  async _filterContraindications(recommendations, patientId) {
    const { rows: contraindications } = await pool.query(`
      SELECT mc.medicationid, mc.severity
      FROM medicationcontraindications mc
      JOIN patientfeatures pf ON mc.condition = pf.featurevalue
      WHERE pf.patientid = $1 AND mc.medicationid = ANY($2)
    `, [patientId, recommendations.map(r => r.MedicationID)]);

    const contraindicated = new Set(contraindications.map(c => c.medicationid));

    return recommendations
      .map(r => ({
        ...r,
        isSafe: !contraindicated.has(r.MedicationID),
        contraindications: contraindications
          .filter(c => c.medicationid === r.MedicationID)
      }))
      .filter(r => r.isSafe)
      .sort((a, b) => b.weight - a.weight || b.confidence - a.confidence);
  }

  _combineRecommendations(...allRecs) {
    const merged = new Map();
    
    allRecs.flat().forEach(rec => {
      if (!merged.has(rec.MedicationID)) {
        merged.set(rec.MedicationID, {
          ...rec,
          sources: [rec.source],
          combinedWeight: rec.weight
        });
      } else {
        const existing = merged.get(rec.MedicationID);
        existing.sources.push(rec.source);
        existing.combinedWeight += rec.weight * 0.3;
      }
    });

    return Array.from(merged.values())
      .sort((a, b) => b.combinedWeight - a.combinedWeight);
  }

  _normalizeText(text) {
    return text.toLowerCase()
      .replace(/[^\w\sа-яё]/gi, '')
      .replace(/\s+/g, ' ');
  }

  _hashFeature(feature) {
    return feature.split('').reduce((hash, char) => {
      return (hash << 5) - hash + char.charCodeAt(0);
    }, 0);
  }

  _findMedicationId(name) {
    const allNames = Array.from(this.medications.values()).map(m => m.name);
    const closestMatch = levenary(name, allNames);
    const med = Array.from(this.medications.values())
      .find(m => m.name === closestMatch);
    return med?.medicationid;
  }
}

class PatientSimilarityEngine {
  constructor() {
    this.patientData = new Map();
  }

  async initialize() {
    try {
      const { rows } = await pool.query(`
        SELECT 
          p.patientid,
          pf.featurevalue,
          pr.medicationid,
          m.name as medicationname
        FROM patients p
        LEFT JOIN patientfeatures pf ON p.patientid = pf.patientid
        LEFT JOIN prescriptions pr ON p.patientid = pr.patientid
        LEFT JOIN medications m ON pr.medicationid = m.medicationid
        WHERE pf.featuretype IN ('заболевание', 'аллергия')
        LIMIT 1000
      `);

      rows.forEach(row => {
        if (!this.patientData.has(row.patientid)) {
          this.patientData.set(row.patientid, {
            features: new Set(),
            medications: new Set()
          });
        }
        if (row.featurevalue) {
          this.patientData.get(row.patientid).features.add(row.featurevalue);
        }
        if (row.medicationid) {
          this.patientData.get(row.patientid).medications.add({
            id: row.medicationid,
            name: row.medicationname
          });
        }
      });
      console.log(`👥 Данные ${this.patientData.size} пациентов загружены`);
    } catch (err) {
      console.error('Ошибка инициализации движка похожих пациентов:', err);
      throw err;
    }
  }

  async getSimilarRecs(patientId, k = 3) {
    if (!this.patientData.has(patientId)) return [];
    
    const current = this.patientData.get(patientId);
    const currentFeatures = [...current.features];
    
    const similarities = [];
    
    this.patientData.forEach((patient, id) => {
      if (id !== patientId && patient.medications.size > 0) {
        const commonFeatures = [...patient.features].filter(f => 
          currentFeatures.includes(f)).length;
        const similarity = commonFeatures / Math.max(
          currentFeatures.length, 
          [...patient.features].length
        );
        
        if (similarity > 0.3) {
          similarities.push({
            patientId: id,
            similarity,
            medications: [...patient.medications]
          });
        }
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
      .flatMap(p => 
        [...p.medications].map(m => ({
          MedicationID: m.id,
          name: m.name,
          confidence: p.similarity * 0.7,
          source: 'similar_patients',
          weight: 0.5
        }))
      );
  }
}

module.exports = new MedicalAI();