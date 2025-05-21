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
    this.contraindications = new Map();
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
      if (diagnoses.length === 0) {
        console.warn('В базе данных нет диагнозов!');
      }
      
      diagnoses.forEach(d => {
        this.diagnoses.set(d.diagnosisid, d);
      });

      // Загрузка лекарств
      const { rows: medications } = await pool.query('SELECT * FROM medications');
      medications.forEach(m => {
        this.medications.set(m.medicationid, m);
      });

      // Загрузка противопоказаний
      const { rows: contraindications } = await pool.query(`
        SELECT * FROM medicationcontraindications
      `);
      contraindications.forEach(c => {
        if (!this.contraindications.has(c.medicationid)) {
          this.contraindications.set(c.medicationid, []);
        }
        this.contraindications.get(c.medicationid).push(c);
      });

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
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
          pf.featuretype,
          p.medicationid
        FROM prescriptions p
        JOIN medicalrecords mr ON p.patientid = mr.patientid
        JOIN medicalrecordentries mre ON mr.recordid = mre.recordid
        JOIN diagnoses d ON mre.diagnosisid = d.diagnosisid
        LEFT JOIN patientfeatures pf ON p.patientid = pf.patientid
        WHERE pf.featuretype IN ('заболевание', 'аллергия', 'непереносимость', 'физиологическая особенность')
        LIMIT 1000
      `);

      if (rows.length === 0) {
        console.log('⚠️ Нет данных для обучения дерева решений');
        return;
      }

      const features = rows.map(row => [
        row.diagnosisid,
        row.featurevalue ? this._hashFeature(row.featurevalue + row.featuretype) : 0
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
      const hasBayesData = this.classifier.getClassifications(diagnosis.name).length > 0;
      const hasDecisionTreeData = this.decisionTree !== null;

      const [protocolRecs, bayesRecs, dtRecs, similarRecs] = await Promise.all([
        this._getProtocolRecs(diagnosisId, patientId),
        hasBayesData ? this._getBayesRecs(diagnosis.name) : [],
        (patientId && hasDecisionTreeData) ? this._getDecisionTreeRecs(diagnosisId, patientId) : [],
        patientId ? this.similarityEngine.getSimilarRecs(patientId) : []
      ]);

      const combined = this._combineRecommendations(protocolRecs, bayesRecs, dtRecs, similarRecs);
      const filtered = patientId ? 
        await this._filterRecommendations(combined, patientId) : 
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

  async _getProtocolRecs(diagnosisId, patientId = null) {
    const { rows } = await pool.query(`
      SELECT m.medicationid, m.name, dm.isfirstline, dm.confidence
      FROM diagnosismedication dm
      JOIN medications m ON dm.medicationid = m.medicationid
      WHERE dm.diagnosisid = $1
      ORDER BY dm.isfirstline DESC, dm.confidence DESC
    `, [diagnosisId]);

    if (!patientId) {
      return rows.map(r => ({
        MedicationID: r.medicationid,
        name: r.name,
        confidence: r.confidence,
        isFirstLine: r.isfirstline,
        source: 'protocol',
        weight: r.isfirstline ? 0.9 : 0.7,
        isSafe: true
      }));
    }

    return rows.map(r => ({
      MedicationID: r.medicationid,
      name: r.name,
      confidence: r.confidence,
      isFirstLine: r.isfirstline,
      source: 'protocol',
      weight: r.isfirstline ? 0.9 : 0.7,
      isSafe: true // Предварительная отметка, проверка будет позже
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
    try {
      // Получаем особенности пациента
      const { rows: features } = await pool.query(`
        SELECT featurevalue, featuretype FROM patientfeatures 
        WHERE patientid = $1 AND featuretype IN ('заболевание', 'аллергия', 'непереносимость', 'физиологическая особенность')
      `, [patientId]);

      // Если нет особенностей, возвращаем пустой массив
      if (features.length === 0) return [];

      // Преобразуем особенности в числовой формат
      const numericFeatures = features.map(f => 
        this._hashFeature(f.featurevalue + f.featuretype)
      );

      // Создаем входные данные для предсказания
      const input = [
        Number(diagnosisId), // Убедимся, что diagnosisId - число
        numericFeatures[0] || 0 // Берем первую особенность или 0
      ];

      console.log('Input for decision tree:', input); // Логируем входные данные

      // Делаем предсказание
      const prediction = this.decisionTree.predict([input]);
      const med = this.medications.get(prediction[0]);

      return med ? [{
        MedicationID: med.medicationid,
        name: med.name,
        confidence: 0.8,
        source: 'decision_tree',
        weight: 0.6
      }] : [];
    } catch (err) {
      console.error('Error in _getDecisionTreeRecs:', err);
      return []; // В случае ошибки возвращаем пустой массив
    }
  }

  async _filterRecommendations(recommendations, patientId) {
    // Получаем все особенности пациента
    const { rows: patientFeatures } = await pool.query(`
      SELECT featurevalue, featuretype FROM patientfeatures 
      WHERE patientid = $1
    `, [patientId]);
  
    if (patientFeatures.length === 0) {
      return recommendations.map(r => ({ ...r, isSafe: true, contraindications: [] }));
    }
  
    const results = [];
    
    for (const rec of recommendations) {
      const contraindications = this.contraindications.get(rec.MedicationID) || [];
      const matchedContraindications = [];
  
      // Нормализуем особенности пациента для сравнения
      const normalizedPatientFeatures = patientFeatures.map(pf => ({
        type: pf.featuretype.toLowerCase(),
        value: this._normalizeText(pf.featurevalue)
      }));
  
      // Проверяем каждое противопоказание лекарства
      for (const contra of contraindications) {
        // Нормализуем данные противопоказания
        const contraCondition = contra.condition ? this._normalizeText(contra.condition) : null;
        const contraType = contra.condition_type ? contra.condition_type.toLowerCase() : null;
        
        // Проверяем по типу и значению особенности пациента
        for (const pf of normalizedPatientFeatures) {
          // Проверяем полное совпадение значения (например, "пенициллин")
          const exactMatch = contraCondition && pf.value === contraCondition;
          
          // Проверяем частичное совпадение (например, "аллергия на пенициллин" содержит "пенициллин")
          const partialMatch = contraCondition && pf.value.includes(contraCondition) || 
                             contraCondition && contraCondition.includes(pf.value);
          
          // Проверяем совпадение по типу (например, "аллергия")
          const typeMatch = contraType && pf.type === contraType;
          
          if (exactMatch || partialMatch || typeMatch) {
            matchedContraindications.push({
              condition: contra.condition || contra.condition_type,
              severity: contra.severity,
              type: pf.type
            });
            break;
          }
        }
      }
  
      // Классифицируем противопоказания по степени тяжести
      const highRisk = matchedContraindications.filter(c => c.severity === 'высокая');
      const mediumRisk = matchedContraindications.filter(c => c.severity === 'средняя');
      const lowRisk = matchedContraindications.filter(c => c.severity === 'низкая');
  
      if (highRisk.length > 0) {
        // Пропускаем препараты с высоким риском
        continue;
      }
  
      results.push({
        ...rec,
        isSafe: matchedContraindications.length === 0,
        contraindications: matchedContraindications,
        // Понижаем вес при наличии противопоказаний
        weight: rec.weight * (matchedContraindications.length > 0 ? 0.5 : 1)
      });
    }
  
    return results.sort((a, b) => {
      // Сначала безопасные, затем по весу
      if (a.isSafe !== b.isSafe) return a.isSafe ? -1 : 1;
      return b.weight - a.weight;
    });
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
      .replace(/\s+/g, ' ')
      .trim();
  }

  _hashFeature(feature) {
    if (!feature) return 0;
    
    let hash = 0;
    for (let i = 0; i < feature.length; i++) {
      const char = feature.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; 
    }
    return Math.abs(hash);
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
          pf.featuretype,
          pr.medicationid,
          m.name as medicationname
        FROM patients p
        LEFT JOIN patientfeatures pf ON p.patientid = pf.patientid
        LEFT JOIN prescriptions pr ON p.patientid = pr.patientid
        LEFT JOIN medications m ON pr.medicationid = m.medicationid
        WHERE pf.featuretype IN ('заболевание', 'аллергия', 'непереносимость', 'физиологическая особенность')
        LIMIT 1000
      `);

      rows.forEach(row => {
        if (!this.patientData.has(row.patientid)) {
          this.patientData.set(row.patientid, {
            features: new Map(), // Теперь используем Map для хранения типа и значения
            medications: new Set()
          });
        }
        if (row.featurevalue) {
          this.patientData.get(row.patientid).features.set(
            row.featurevalue, 
            row.featuretype
          );
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
    
    const currentPatient = this.patientData.get(patientId);
    const currentFeatures = [...currentPatient.features.entries()];
    
    const similarities = [];
    
    this.patientData.forEach((patient, id) => {
      if (id !== patientId && patient.medications.size > 0) {
        let commonFeatures = 0;
        
        // Сравниваем особенности с учетом их типа
        for (const [value, type] of currentFeatures) {
          if (patient.features.has(value) && 
              patient.features.get(value) === type) {
            commonFeatures++;
          }
        }
        
        const similarity = commonFeatures / Math.max(
          currentFeatures.length, 
          patient.features.size
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