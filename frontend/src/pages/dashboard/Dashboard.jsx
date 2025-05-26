import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getAppointments } from "../../api/appointmentApi"
import { getAllPatients } from "../../api/patientApi"
import { getAllMedicalRecords } from "../../api/medicalRecordApi"
import { getAllSchedules } from "../../api/scheduleApi"
import Header from "../../components/Header"
import Button from "../../components/Button"
import Loader from "../../components/Loader"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [schedules, setSchedules] = useState([])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [appointmentsData, patientsData, medicalRecordsData, schedulesData] = await Promise.all([
        getAppointments(),
        getAllPatients(),
        getAllMedicalRecords(),
        getAllSchedules()
      ])
      setAppointments(appointmentsData)
      setPatients(patientsData)
      setMedicalRecords(medicalRecordsData)
      setSchedules(schedulesData)
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
    } finally {
      setLoading(false)
    }
  }

  // Получаем график работы текущего пользователя
  const userSchedule = useMemo(() => {
    if (!user || !schedules.length) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return schedules
      .filter(schedule => 
        schedule.doctorid === user.userid && 
        new Date(schedule.date) >= today
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [user, schedules])

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Панель управления" />

      <div className="container mx-auto p-3 sm:p-4">
        {loading ? (
          <Loader className="flex justify-center my-6 sm:my-8" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Карточка с количеством пациентов */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Пациенты</h2>
              <p className="text-3xl font-bold mb-4">{patients.length}</p>
              <Button 
                onClick={() => navigate("/patients")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
              >
                Перейти к пациентам
              </Button>
            </div>

            {/* Карточка с количеством медицинских карт */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Медицинские карты</h2>
              <p className="text-3xl font-bold mb-4">{medicalRecords.length}</p>
              <Button 
                onClick={() => navigate("/medical-records")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
              >
                Перейти к картам
              </Button>
            </div>

            {/* Карточка с количеством приемов */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Приемы</h2>
              <p className="text-3xl font-bold mb-4">{appointments.length}</p>
              <Button 
                onClick={() => navigate("/appointments")} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
              >
                Перейти к приемам
              </Button>
            </div>

            {/* Карточка с графиком работы */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Мой график работы</h2>
              
              {userSchedule.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Дата</th>
                        <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Начало</th>
                        <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Конец</th>
                        <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Тип</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userSchedule.slice(0, 5).map((schedule) => (
                        <tr key={schedule.scheduleid} className="hover:bg-gray-50">
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                            {new Date(schedule.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                            {schedule.starttime.slice(0, 5)}
                          </td>
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                            {schedule.endtime.slice(0, 5)}
                          </td>
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                            {schedule.eventtypeid === 1 ? 'Рабочий день' : 'Другое'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  У вас нет запланированных рабочих смен
                </div>
              )}
              
              <div className="mt-4">
                <Button 
                  onClick={() => navigate("/manage-schedules")}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                >
                  Управление графиком
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard