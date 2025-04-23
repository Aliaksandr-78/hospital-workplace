import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from "../../api/appointmentApi";
import { getAllPatients } from "../../api/patientApi";
import { getAllUsers } from "../../api/userApi";
import { getAllSchedules } from "../../api/scheduleApi";
import { getAllSpecialties } from "../../api/specialtyApi";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Header from "../../components/Header";

const Appointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    patientid: "",
    doctorid: user?.userid || "",
    date: "",
    time: "",
    reason: "",
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isDoctorAvailable, setIsDoctorAvailable] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsData, patientsData, doctorsData, schedulesData, specialtiesData] = await Promise.all([
        getAppointments(),
        getAllPatients(),
        getAllUsers(),
        getAllSchedules(),
        getAllSpecialties(),
      ]);

      const availableDoctors = doctorsData.filter(doctor => {
        const doctorSchedule = schedulesData.find(schedule => schedule.doctorid === doctor.userid && schedule.eventtypeid === 1);
        return doctorSchedule;
      });

      setAppointments(appointmentsData);
      setPatients(patientsData);
      setDoctors(availableDoctors);
      setSchedules(schedulesData);
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "date" && formData.doctorid) {
      checkDoctorAvailability(formData.doctorid, value);
    }
  };

  const checkDoctorAvailability = (doctorId, date) => {
    const doctorSchedule = schedules.find(schedule => {
      const scheduleDate = new Date(schedule.date).toLocaleDateString('en-CA');
      return schedule.doctorid === doctorId && scheduleDate === date;
    });
  
    if (doctorSchedule) {
      setIsDoctorAvailable(true);
      generateTimeSlots(doctorSchedule.starttime, doctorSchedule.endtime, doctorId, date);
    } else {
      setIsDoctorAvailable(false);
      setAvailableTimeSlots([]);
    }
  };

  const generateTimeSlots = (startTime, endTime, doctorId, date) => {
    const slots = [];
    let currentTime = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
  
    const existingAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date).toLocaleDateString('en-CA');
      return (
        appointment.doctorid === doctorId &&
        appointmentDate === date
      );
    });
  
    while (currentTime < end) {
      const timeSlot = currentTime.toTimeString().slice(0, 5);
      const isSlotAvailable = !existingAppointments.some(appointment => appointment.time.slice(0, 5) === timeSlot);
      slots.push({ time: timeSlot, available: isSlotAvailable });
      currentTime = new Date(currentTime.getTime() + 20 * 60000);
    }
  
    setAvailableTimeSlots(slots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.patientid || !formData.doctorid || !formData.date || !formData.time || !formData.reason) {
      alert("Все поля обязательны для заполнения.");
      return;
    }
  
    const doctorSchedule = schedules.find(schedule => {
      const scheduleDate = new Date(schedule.date).toLocaleDateString('en-CA');
      return schedule.doctorid === formData.doctorid && scheduleDate === formData.date;
    });
  
    if (!doctorSchedule) {
      alert("Врач не принимает пациентов в выбранную дату.");
      return;
    }
  
    const appointmentTime = formData.time.slice(0, 5);
    const startTime = doctorSchedule.starttime.slice(0, 5);
    const endTime = doctorSchedule.endtime.slice(0, 5);
  
    if (appointmentTime < startTime || appointmentTime >= endTime) {
      alert("Время записи вне рабочего времени врача.");
      return;
    }
  
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const appointmentMinutes = parseInt(appointmentTime.split(':')[0]) * 60 + parseInt(appointmentTime.split(':')[1]);
    const timeDiff = appointmentMinutes - startMinutes;
  
    if (timeDiff % 20 !== 0) {
      alert("Запись возможна только каждые 20 минут.");
      return;
    }
  
    // Проверка на наличие записи к врачу на это время
    const isTimeSlotAvailable = !appointments.some(appointment => {
      const appointmentDate = new Date(appointment.date).toLocaleDateString('en-CA');
      return (
        appointment.doctorid === formData.doctorid &&
        appointmentDate === formData.date &&
        appointment.time.slice(0, 5) === formData.time.slice(0, 5)
      );
    });
  
    if (!isTimeSlotAvailable) {
      alert("Это время уже занято.");
      return;
    }
  
    try {
      const appointmentData = {
        ...formData,
        date: new Date(formData.date).toLocaleDateString('en-CA'),
        time: `${formData.time}:00`,
      };
  
      console.log("Данные для отправки на сервер:", appointmentData);
  
      if (currentAppointment) {
        await updateAppointment(currentAppointment.appointmentid, appointmentData);
      } else {
        await createAppointment(appointmentData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Ошибка при сохранении приема:", error);
    }
  };

  const handleEdit = (appointment) => {
    console.log("Editing appointment:", appointment);
    const patient = patients.find((p) => p.patientid === appointment.patientid);
    const doctor = doctors.find((d) => d.userid === appointment.doctorid);
  
    setCurrentAppointment(appointment);
    setSelectedPatient(patient);
    setSelectedDoctor(doctor);
    setFormData({
      patientid: appointment.patientid,
      doctorid: appointment.doctorid,
      date: new Date(appointment.date).toLocaleDateString('en-CA'),
      time: appointment.time.slice(0, 5),
      reason: appointment.reason,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (appointmentId) => {
    try {
      await deleteAppointment(appointmentId);
      fetchData();
    } catch (error) {
      console.error("Ошибка при удалении приема:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsDoctorModalOpen(false);
    setIsPatientModalOpen(false);
    setCurrentAppointment(null);
    setFormData({
      patientid: "",
      doctorid: user?.userid || "",
      date: "",
      time: "",
      reason: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление приемами" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Управление приемами</h1>

        {loading ? (
          <Loader className="flex justify-center my-8" />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                Создать новый прием
              </Button>
            </div>

            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Пациент</th>
                  <th className="py-2 px-4 border-b">Врач</th>
                  <th className="py-2 px-4 border-b">Дата</th>
                  <th className="py-2 px-4 border-b">Время</th>
                  <th className="py-2 px-4 border-b">Причина</th>
                  <th className="py-2 px-4 border-b">Действия</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const patient = patients.find((p) => p.patientid === appointment.patientid);
                  console.log("Appointments:", appointments);
                  console.log("Doctors (users):", doctors);
                  const doctor = doctors.find((d) => d.userid === appointment.doctorid);

                  return (
                    <tr key={appointment.appointmentid} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">
                        {patient ? `${patient.lastname} ${patient.firstname} ${patient.middlename || ''}` : "Неизвестный пациент"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {doctor ? `${doctor.lastname} ${doctor.firstname} ${doctor.middlename || ''}` : "Неизвестный врач"}
                      </td>
                      <td className="py-2 px-4 border-b">{new Date(appointment.date).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b">{appointment.time.slice(0, 5)}</td>
                      <td className="py-2 px-4 border-b">{appointment.reason}</td>
                      <td className="py-2 px-4 border-b">
                        <Button onClick={() => handleEdit(appointment)} className="mr-2 bg-blue-600 hover:bg-blue-700">
                          Редактировать
                        </Button>
                        <Button onClick={() => handleDelete(appointment.appointmentid)} className="bg-red-600 hover:bg-red-700">
                          Удалить
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={handleCancel}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentAppointment ? "Редактировать прием" : "Создать новый прием"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Пациент</label>
                <Button onClick={() => setIsPatientModalOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                  {selectedPatient ? `${selectedPatient.lastname} ${selectedPatient.firstname}` : "Выберите пациента"}
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Врач</label>
                <Button onClick={() => setIsDoctorModalOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                  {selectedDoctor ? `${selectedDoctor.lastname} ${selectedDoctor.firstname}` : "Выберите врача"}
                </Button>
              </div>
              <Input
                label="Дата"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                type="date"
              />
              {isDoctorAvailable ? (
                <Input
                label="Время"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                type="select"
                >
                  <option value="">Выберите время</option>
                  {availableTimeSlots.map((slot, index) => (
                    <option
                      key={index}
                      value={slot.time}
                      disabled={!slot.available} // Делаем слот недоступным, если он занят
                      style={{ color: slot.available ? 'black' : 'lightgray' }} // Стилизуем недоступные слоты
                    >
                      {slot.time}
                    </option>
                  ))}
                </Input>
              ) : (
                <p className="text-red-500">Врач не принимает пациентов в выбранную дату.</p>
              )}
              <Input
                label="Причина"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                type="text"
              />
              <div className="flex justify-end space-x-4">
                <Button type="button" onClick={handleCancel} className="bg-gray-600 hover:bg-gray-700">
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={!isDoctorAvailable}>
                  {currentAppointment ? "Сохранить" : "Создать"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Выберите врача</h2>
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.userid}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setFormData({ ...formData, doctorid: doctor.userid });
                    setIsDoctorModalOpen(false);
                  }}
                >
                  <p><strong>ФИО:</strong> {doctor.lastname} {doctor.firstname} {doctor.middlename}</p>
                  <p><strong>Специальность:</strong> {specialties.find(s => s.specialtyid === doctor.specialtyid)?.specialtyname}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>

        <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Выберите пациента</h2>
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.patientid}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedPatient(patient);
                    setFormData({ ...formData, patientid: patient.patientid });
                    setIsPatientModalOpen(false);
                  }}
                >
                  <p><strong>ФИО:</strong> {patient.lastname} {patient.firstname} {patient.middlename}</p>
                  <p><strong>Дата рождения:</strong> {patient.dateofbirth}</p>
                  <p><strong>Адрес:</strong> {patient.address}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Appointments;