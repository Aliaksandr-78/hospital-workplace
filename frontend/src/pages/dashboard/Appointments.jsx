import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from "../../api/appointmentApi";
import { getAllPatients } from "../../api/patientApi";
import { getAllUsers } from "../../api/userApi";
import { getAllSchedules } from "../../api/scheduleApi";
import { getAllSpecialties } from "../../api/specialtyApi";
import { getAllRoles } from "../../api/roleApi";
import { getUserRolesByUserId } from "../../api/userRoleApi";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Header from "../../components/Header";

const Appointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
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
  const [userRoles, setUserRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);

  // Состояния для поиска и сортировки
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [patientModalSearch, setPatientModalSearch] = useState("");
  const [doctorModalSearch, setDoctorModalSearch] = useState("");
  const [patientSortConfig, setPatientSortConfig] = useState({ key: null, direction: 'asc' });
  const [doctorSortConfig, setDoctorSortConfig] = useState({ key: null, direction: 'asc' });

  // Проверка ролей
  const isAdmin = () => {
    return userRoles.some(userRole => {
      const role = allRoles.find(r => r.roleid === userRole.roleid);
      return role && role.rolename === "Администратор";
    });
  };

  const isNurse = () => {
    return userRoles.some(userRole => {
      const role = allRoles.find(r => r.roleid === userRole.roleid);
      return role && role.rolename === "Медсестра";
    });
  };

  const isDoctor = () => {
    return userRoles.some(userRole => {
      const role = allRoles.find(r => r.roleid === userRole.roleid);
      return role && role.rolename === "Доктор";
    });
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortAppointments();
  }, [appointments, patientSearch, doctorSearch, dateSearch, sortConfig]);

  useEffect(() => {
    if (patients.length > 0) {
      filterAndSortPatients();
    }
  }, [patients, patientModalSearch, patientSortConfig]);

  useEffect(() => {
    if (doctors.length > 0) {
      filterAndSortDoctors();
    }
  }, [doctors, doctorModalSearch, doctorSortConfig]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsData, patientsData, doctorsData, schedulesData, specialtiesData, rolesData, userRolesData] = 
        await Promise.all([
          getAppointments(),
          getAllPatients(),
          getAllUsers(),
          getAllSchedules(),
          getAllSpecialties(),
          getAllRoles(),
          user?.userid ? getUserRolesByUserId(user.userid) : Promise.resolve([]),
        ]);

      const availableDoctors = doctorsData.filter(doctor => {
        const doctorSchedule = schedulesData.find(schedule => schedule.doctorid === doctor.userid && schedule.eventtypeid === 1);
        return doctorSchedule;
      });

      setAppointments(appointmentsData);
      setPatients(patientsData);
      setFilteredPatients(patientsData);
      setDoctors(availableDoctors);
      setFilteredDoctors(availableDoctors);
      setSchedules(schedulesData);
      setSpecialties(specialtiesData);
      setAllRoles(rolesData);
      setUserRoles(userRolesData);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAppointments = () => {
    let result = [...appointments];
    
    // Для доктора показываем только его приемы
    if (isDoctor()) {
      result = result.filter(appointment => appointment.doctorid === user.userid);
    }
    
    // Фильтрация по пациенту
    if (patientSearch) {
      const searchLower = patientSearch.toLowerCase();
      result = result.filter(appointment => {
        const patient = patients.find(p => p.patientid === appointment.patientid);
        if (!patient) return false;
        return (
          patient.lastname.toLowerCase().includes(searchLower) ||
          patient.firstname.toLowerCase().includes(searchLower) ||
          patient.middlename?.toLowerCase().includes(searchLower)
      )});
    }
    
    // Фильтрация по врачу
    if (doctorSearch) {
      const searchLower = doctorSearch.toLowerCase();
      result = result.filter(appointment => {
        const doctor = doctors.find(d => d.userid === appointment.doctorid);
        if (!doctor) return false;
        return (
          doctor.lastname.toLowerCase().includes(searchLower) ||
          doctor.firstname.toLowerCase().includes(searchLower) ||
          doctor.middlename?.toLowerCase().includes(searchLower)
      )});
    }
    
    // Фильтрация по дате
    if (dateSearch) {
      const searchDate = new Date(dateSearch).toISOString().split('T')[0];
      result = result.filter(appointment => 
        new Date(appointment.date).toISOString().split('T')[0] === searchDate
      );
    }
    
    // Сортировка
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valueA, valueB;
        
        if (sortConfig.key === 'patient') {
          const patientA = patients.find(p => p.patientid === a.patientid);
          const patientB = patients.find(p => p.patientid === b.patientid);
          valueA = patientA ? `${patientA.lastname} ${patientA.firstname} ${patientA.middlename || ''}` : '';
          valueB = patientB ? `${patientB.lastname} ${patientB.firstname} ${patientB.middlename || ''}` : '';
        } else if (sortConfig.key === 'doctor') {
          const doctorA = doctors.find(d => d.userid === a.doctorid);
          const doctorB = doctors.find(d => d.userid === b.doctorid);
          valueA = doctorA ? `${doctorA.lastname} ${doctorA.firstname} ${doctorA.middlename || ''}` : '';
          valueB = doctorB ? `${doctorB.lastname} ${doctorB.firstname} ${doctorB.middlename || ''}` : '';
        } else if (sortConfig.key === 'date') {
          valueA = new Date(a.date);
          valueB = new Date(b.date);
        } else {
          valueA = a[sortConfig.key];
          valueB = b[sortConfig.key];
        }
        
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredAppointments(result);
  };

  const filterAndSortPatients = () => {
    let result = [...patients];
    
    // Фильтрация пациентов
    if (patientModalSearch) {
      const searchLower = patientModalSearch.toLowerCase();
      result = result.filter(patient => 
        `${patient.lastname} ${patient.firstname} ${patient.middlename || ''}`
          .toLowerCase()
          .includes(searchLower))
    }
    
    // Сортировка пациентов
    if (patientSortConfig.key) {
      result.sort((a, b) => {
        let valueA, valueB;
        
        if (patientSortConfig.key === 'name') {
          valueA = `${a.lastname} ${a.firstname} ${a.middlename || ''}`;
          valueB = `${b.lastname} ${b.firstname} ${b.middlename || ''}`;
        } else {
          valueA = a[patientSortConfig.key];
          valueB = b[patientSortConfig.key];
        }
        
        if (valueA < valueB) {
          return patientSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return patientSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredPatients(result);
  };

  const filterAndSortDoctors = () => {
    let result = [...doctors];
    
    // Фильтрация врачей
    if (doctorModalSearch) {
      const searchLower = doctorModalSearch.toLowerCase();
      result = result.filter(doctor => 
        `${doctor.lastname} ${doctor.firstname} ${doctor.middlename || ''}`
          .toLowerCase()
          .includes(searchLower))
    }
    
    // Сортировка врачей
    if (doctorSortConfig.key) {
      result.sort((a, b) => {
        let valueA, valueB;
        
        if (doctorSortConfig.key === 'name') {
          valueA = `${a.lastname} ${a.firstname} ${a.middlename || ''}`;
          valueB = `${b.lastname} ${b.firstname} ${b.middlename || ''}`;
        } else if (doctorSortConfig.key === 'specialty') {
          const specialtyA = specialties.find(s => s.specialtyid === a.specialtyid)?.specialtyname || '';
          const specialtyB = specialties.find(s => s.specialtyid === b.specialtyid)?.specialtyname || '';
          valueA = specialtyA;
          valueB = specialtyB;
        } else {
          valueA = a[doctorSortConfig.key];
          valueB = b[doctorSortConfig.key];
        }
        
        if (valueA < valueB) {
          return doctorSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return doctorSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredDoctors(result);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const requestPatientSort = (key) => {
    let direction = 'asc';
    if (patientSortConfig.key === key && patientSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPatientSortConfig({ key, direction });
  };

  const requestDoctorSort = (key) => {
    let direction = 'asc';
    if (doctorSortConfig.key === key && doctorSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setDoctorSortConfig({ key, direction });
  };

  const getSortIndicator = (key, config) => {
    if (config.key !== key) return null;
    return config.direction === 'asc' ? ' ↑' : ' ↓';
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

  const resetFilters = () => {
    setPatientSearch("");
    setDoctorSearch("");
    setDateSearch("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление приемами" />

      <div className="container mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          {isDoctor() ? "Мои приемы" : "Управление приемами"}
        </h1>

        {loading ? (
          <Loader className="flex justify-center my-6 sm:my-8" />
        ) : (
          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Input
                  type="text"
                  placeholder="Поиск по пациенту..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full sm:w-48 md:w-64"
                />
                {!isDoctor() && (
                  <Input
                    type="text"
                    placeholder="Поиск по врачу..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full sm:w-48 md:w-64"
                  />
                )}
                <Input
                  type="date"
                  placeholder="Фильтр по дате..."
                  value={dateSearch}
                  onChange={(e) => setDateSearch(e.target.value)}
                  className="w-full sm:w-48"
                />
                {(patientSearch || doctorSearch || dateSearch) && (
                  <Button 
                    onClick={resetFilters}
                    className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                  >
                    Сбросить фильтры
                  </Button>
                )}
              </div>
              {isNurse() && (
                <Button 
                  onClick={() => setIsModalOpen(true)} 
                  className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                >
                  Создать новый прием
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th 
                      className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('patient')}
                    >
                      Пациент {getSortIndicator('patient', sortConfig)}
                    </th>
                    {!isDoctor() && (
                      <th 
                        className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer hover:bg-gray-50"
                        onClick={() => requestSort('doctor')}
                      >
                        Врач {getSortIndicator('doctor', sortConfig)}
                      </th>
                    )}
                    <th 
                      className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('date')}
                    >
                      Дата {getSortIndicator('date', sortConfig)}
                    </th>
                    <th 
                      className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('time')}
                    >
                      Время {getSortIndicator('time', sortConfig)}
                    </th>
                    <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Причина</th>
                    {isNurse() && <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => {
                      const patient = patients.find((p) => p.patientid === appointment.patientid);
                      const doctor = doctors.find((d) => d.userid === appointment.doctorid);

                      return (
                        <tr key={appointment.appointmentid} className="hover:bg-gray-50">
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                            {patient ? `${patient.lastname} ${patient.firstname} ${patient.middlename || ''}` : "Неизвестный пациент"}
                          </td>
                          {!isDoctor() && (
                            <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                              {doctor ? `${doctor.lastname} ${doctor.firstname} ${doctor.middlename || ''}` : "Неизвестный врач"}
                            </td>
                          )}
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{new Date(appointment.date).toLocaleDateString()}</td>
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{appointment.time.slice(0, 5)}</td>
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{appointment.reason}</td>
                          {isNurse() && (
                            <td className="py-2 px-2 sm:px-4 border-b">
                              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <Button 
                                  onClick={() => handleEdit(appointment)} 
                                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                                >
                                  Редактировать
                                </Button>
                                <Button 
                                  onClick={() => handleDelete(appointment.appointmentid)} 
                                  className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                                >
                                  Удалить
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={isDoctor() ? (isNurse() ? 5 : 4) : (isNurse() ? 6 : 5)} className="py-4 text-center text-xs sm:text-sm text-gray-500">
                        {appointments.length === 0 ? "Нет данных о приемах" : "Ничего не найдено"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isNurse() && (
          <Modal isOpen={isModalOpen} onClose={handleCancel}>
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                {currentAppointment ? "Редактировать прием" : "Создать новый прием"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700">Пациент</label>
                  <Button 
                    onClick={() => setIsPatientModalOpen(true)} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                  >
                    {selectedPatient ? `${selectedPatient.lastname} ${selectedPatient.firstname}` : "Выберите пациента"}
                  </Button>
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700">Врач</label>
                  <Button 
                    onClick={() => setIsDoctorModalOpen(true)} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                  >
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
                        disabled={!slot.available}
                        style={{ color: slot.available ? 'black' : 'lightgray' }}
                      >
                        {slot.time}
                      </option>
                    ))}
                  </Input>
                ) : (
                  <p className="text-red-500 text-sm sm:text-base">Врач не принимает пациентов в выбранную дату.</p>
                )}
                <Input
                  label="Причина"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  type="text"
                />
                <div className="flex justify-end gap-3 sm:gap-4">
                  <Button 
                    type="button" 
                    onClick={handleCancel} 
                    className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 text-sm sm:text-base" 
                    disabled={!isDoctorAvailable}
                  >
                    {currentAppointment ? "Сохранить" : "Создать"}
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {isNurse() && (
          <Modal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)}>
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Выберите врача</h2>
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Поиск врача..."
                  value={doctorModalSearch}
                  onChange={(e) => setDoctorModalSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex mb-2 text-xs sm:text-sm">
                <div 
                  className="w-1/3 p-2 font-semibold cursor-pointer"
                  onClick={() => requestDoctorSort('name')}
                >
                  ФИО {getSortIndicator('name', doctorSortConfig)}
                </div>
                <div 
                  className="w-1/3 p-2 font-semibold cursor-pointer"
                  onClick={() => requestDoctorSort('specialty')}
                >
                  Специальность {getSortIndicator('specialty', doctorSortConfig)}
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto text-sm sm:text-base">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.userid}
                    className="p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
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
        )}
        
        {isNurse() && (
          <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)}>
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Выберите пациента</h2>
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Поиск пациента..."
                  value={patientModalSearch}
                  onChange={(e) => setPatientModalSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex mb-2 text-xs sm:text-sm">
                <div 
                  className="w-1/2 p-2 font-semibold cursor-pointer"
                  onClick={() => requestPatientSort('name')}
                >
                  ФИО {getSortIndicator('name', patientSortConfig)}
                </div>
                <div 
                  className="w-1/2 p-2 font-semibold cursor-pointer"
                  onClick={() => requestPatientSort('dateofbirth')}
                >
                  Дата рождения {getSortIndicator('dateofbirth', patientSortConfig)}
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto text-sm sm:text-base">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.patientid}
                    className="p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
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
        )}
      </div>
    </div>
  );
};

export default Appointments;