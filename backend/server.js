require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const { pool } = require('./config/db')

const appointmentRoutes = require('./routes/appointmentRoutes')
const consentFormRoutes = require('./routes/consentFormRoutes')
const documentTemplateRoutes = require('./routes/documentTemplateRoutes')
const labTestCatalogRoutes = require('./routes/labTestCatalogRoutes')
const medicalCertificateRoutes = require('./routes/medicalCertificateRoutes')
const medicalDischargeRoutes = require('./routes/medicalDischargeRoutes')
const medicalRecordRoutes = require('./routes/medicalRecordRoutes')
const medicationRoutes = require('./routes/medicationRoutes')
const patientRoutes = require('./routes/patientRoutes')
const prescriptionRoutes = require('./routes/prescriptionRoutes')
const roleRoutes = require('./routes/roleRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')
const serviceRoutes = require('./routes/serviceRoutes')
const specialtyRoutes = require('./routes/specialtyRoutes')
const userRoleRoutes = require('./routes/userRoleRoutes')
const userRoutes = require('./routes/userRoutes')
const eventTypesRoutes = require('./routes/eventTypesRoutes')
const medicalRecordEntryRoutes = require('./routes/medicalRecordEntryRoutes')
const labTestResultController = require('./routes/labTestResultRoutes')
const aiRoutes = require('./routes/aiRoutes')
const diagnosisRoutes = require('./routes/diagnosisRoutes')
const diagnosisMedicationRoutes = require('./routes/diagnosisMedicationRoutes')
const medicationContraindicationsRoutes = require('./routes/medicationContraindicationsRoutes')
const patientFeaturesRoutes = require('./routes/patientFeaturesRoutes')

const app = express()

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // Разрешить запросы с учётными данными
}))
app.use(bodyParser.json())
app.use(morgan('dev'))

app.use('/api/appointment', appointmentRoutes)
app.use('/api/consent-form', consentFormRoutes)
app.use('/api/document-template', documentTemplateRoutes)
app.use('/api/lab-test-catalog', labTestCatalogRoutes)
app.use('/api/medical-certificate', medicalCertificateRoutes)
app.use('/api/medical-discharge', medicalDischargeRoutes)
app.use('/api/medical-records', medicalRecordRoutes)
app.use('/api/medications', medicationRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/role', roleRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/service', serviceRoutes)
app.use('/api/specialty', specialtyRoutes)
app.use('/api/user-role', userRoleRoutes)
app.use('/api/user', userRoutes)
app.use('/api/event-types', eventTypesRoutes)
app.use('/api/medical-record-entry', medicalRecordEntryRoutes)
app.use('/api/lab-test-result', labTestResultController)
app.use('/api/ai', aiRoutes)
app.use('/api/diagnosis', diagnosisRoutes)
app.use('/api/diagnosis-medication', diagnosisMedicationRoutes)
app.use('/api/medication-contraindications', medicationContraindicationsRoutes)
app.use('/api/patient-features', patientFeaturesRoutes)



pool.connect()
    .then(() => console.log('✅ Database connected successfully'))
    .catch((err) => console.error('❌ Database connection error:', err))

app.get('/', (req, res) => {
    res.send('Welcome to the Medical API! 🚀')
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Internal Server Error' })
})

const PORT = process.env.PORT_SERVER || 5000
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`)
})
