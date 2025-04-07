import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { getAppointments } from "../../api/appointmentApi"
import { getAllMedicalDischarges } from "../../api/medicalDischargeApi"
import { getAllMedicalCertificates } from "../../api/medicalCertificateApi"
import { getAllPatients } from "../../api/patientApi"
import Button from "../../components/Button"
import Loader from "../../components/Loader"
import Input from "../../components/Input"

const Reports = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [discharges, setDischarges] = useState([])
  const [certificates, setCertificates] = useState([])
  const [patients, setPatients] = useState([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const [appointmentsData, dischargesData, certificatesData, patientsData] = await Promise.all([
        getAppointments(),
        getAllMedicalDischarges(),
        getAllMedicalCertificates(),
        getAllPatients(),
      ])
      setAppointments(appointmentsData)
      setDischarges(dischargesData)
      setCertificates(certificatesData)
      setPatients(patientsData)
    } catch (error) {
      console.error("Ошибка при загрузке отчетов:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterDataByDate = (data) => {
    return data.filter((item) => {
      const itemDate = new Date(item.Date || item.DischargeDate || item.IssuedDate)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return (!startDate || itemDate >= start) && (!endDate || itemDate <= end)
    })
  }

  const filteredAppointments = filterDataByDate(appointments)
  const filteredDischarges = filterDataByDate(discharges)
  const filteredCertificates = filterDataByDate(certificates)

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Отчеты</h1>

      <div className="mb-6 flex space-x-4">
        <Input
          type="date"
          label="Начальная дата"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          label="Конечная дата"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button onClick={fetchReports} color="primary">
          Обновить отчеты
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Приемы</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Пациент</th>
                    <th className="px-4 py-2 border">Врач</th>
                    <th className="px-4 py-2 border">Дата</th>
                    <th className="px-4 py-2 border">Время</th>
                    <th className="px-4 py-2 border">Причина</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.AppointmentID}>
                      <td className="px-4 py-2 border">
                        {patients.find((p) => p.PatientID === appointment.PatientID)?.LastName}{" "}
                        {patients.find((p) => p.PatientID === appointment.PatientID)?.FirstName}
                      </td>
                      <td className="px-4 py-2 border">
                        {user?.LastName} {user?.FirstName}
                      </td>
                      <td className="px-4 py-2 border">{appointment.Date}</td>
                      <td className="px-4 py-2 border">{appointment.Time}</td>
                      <td className="px-4 py-2 border">{appointment.Reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Выписки</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Пациент</th>
                    <th className="px-4 py-2 border">Врач</th>
                    <th className="px-4 py-2 border">Дата выписки</th>
                    <th className="px-4 py-2 border">Заключение</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDischarges.map((discharge) => (
                    <tr key={discharge.DischargeID}>
                      <td className="px-4 py-2 border">
                        {patients.find((p) => p.PatientID === discharge.PatientID)?.LastName}{" "}
                        {patients.find((p) => p.PatientID === discharge.PatientID)?.FirstName}
                      </td>
                      <td className="px-4 py-2 border">
                        {user?.LastName} {user?.FirstName}
                      </td>
                      <td className="px-4 py-2 border">{discharge.DischargeDate}</td>
                      <td className="px-4 py-2 border">{discharge.Summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Справки</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Пациент</th>
                    <th className="px-4 py-2 border">Выдано</th>
                    <th className="px-4 py-2 border">Дата выдачи</th>
                    <th className="px-4 py-2 border">Тип справки</th>
                    <th className="px-4 py-2 border">Детали</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map((certificate) => (
                    <tr key={certificate.CertificateID}>
                      <td className="px-4 py-2 border">
                        {patients.find((p) => p.PatientID === certificate.PatientID)?.LastName}{" "}
                        {patients.find((p) => p.PatientID === certificate.PatientID)?.FirstName}
                      </td>
                      <td className="px-4 py-2 border">
                        {user?.LastName} {user?.FirstName}
                      </td>
                      <td className="px-4 py-2 border">{certificate.IssuedDate}</td>
                      <td className="px-4 py-2 border">{certificate.CertificateType}</td>
                      <td className="px-4 py-2 border">{certificate.Details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Reports