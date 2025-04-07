import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { getAppointments } from "../../api/appointmentApi"
import { getAllPatients } from "../../api/patientApi"
import { getAllMedicalRecords } from "../../api/medicalRecordApi"
import Header from "../../components/Header"
import Button from "../../components/Button"
import Loader from "../../components/Loader"

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [appointmentsData, patientsData, medicalRecordsData] = await Promise.all([
        getAppointments(),
        getAllPatients(),
        getAllMedicalRecords(),
      ])
      setAppointments(appointmentsData)
      setPatients(patientsData)
      setMedicalRecords(medicalRecordsData)
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Header appName="Панель управления" />
      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Карточка с количеством пациентов */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Пациенты</h2>
            <p className="text-3xl font-bold">{patients.length}</p>
            <Button to="/patients" color="primary" className="mt-4">
              Перейти к пациентам
            </Button>
          </div>

          {/* Карточка с количеством приемов */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Приемы</h2>
            <p className="text-3xl font-bold">{appointments.length}</p>
            <Button to="/appointments" color="primary" className="mt-4">
              Перейти к приемам
            </Button>
          </div>

          {/* Карточка с количеством медицинских карт */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Медицинские карты</h2>
            <p className="text-3xl font-bold">{medicalRecords.length}</p>
            <Button to="/medical-records" color="primary" className="mt-4">
              Перейти к картам
            </Button>
          </div>

          {/* Карточка с ближайшими приемами */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-semibold mb-4">Ближайшие приемы</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Пациент</th>
                    <th className="px-4 py-2 border">Дата</th>
                    <th className="px-4 py-2 border">Время</th>
                    <th className="px-4 py-2 border">Причина</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment.AppointmentID}>
                      <td className="px-4 py-2 border">
                        {patients.find((p) => p.PatientID === appointment.PatientID)?.LastName}{" "}
                        {patients.find((p) => p.PatientID === appointment.PatientID)?.FirstName}
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
        </div>
      )}
    </div>
  )
}

export default Dashboard