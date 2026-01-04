import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Check, User, Scissors, ChevronLeft, Star, Sparkles, MapPin, Phone, Wand2, X, Mail, Loader2, AlertCircle, Image, PlusSquare } from 'lucide-react';
import logoimg from './img/LogoTransparente.png';
import { createBooking2 } from './api/bookings2';
import { getServices } from "./api/services";
// --- CONFIGURACIÓN DE EMAILJS (REEMPLAZA ESTOS VALORES) ---
// Regístrate gratis en https://www.emailjs.com/ para obtener estos datos
const EMAILJS_SERVICE_ID = "service_9fnrr6p";   // Ej: "service_gmail" 
const EMAILJS_TEMPLATE_ID = "template_ubjfkzk"; // Ej: "template_reserva"
const EMAILJS_PUBLIC_KEY = "service_9fnrr6p";   // Ej: "user_12345abcde"

// --- CONSTANTES Y DATOS ---
const CURRENCY_SYMBOL = "L"; // Símbolo de Lempira Hondureño (HNL)
// -- Importanto mi logo -- //


// Servicios actualizados según la imagen y descripciones investigadas
/*const SERVICES = [
  {
    id: "0f4c473b-4803-4565-98ec-595ece933ccf",
    name: "Manicura Rusa + Semipermanente",
    price: 350,
    duration: "60 min",
    description: "Técnica de limpieza profunda de cutículas con torno (fresa) para una base impecable y esmaltado de gel de larga duración.",
    color: "bg-rose-100",
    isAddon: false
  },
  {
    id: "3b2269d5-7028-4d3f-9e22-1464e07c0613",
    name: "Calcio + Semipermanente",
    price: 400,
    duration: "120 min",
    description: "Aplicación de una base de calcio fortalecedora bajo el esmalte semipermanente, ideal para uñas débiles o quebradizas.",
    color: "bg-purple-100",
    isAddon: false
  },
  {
    id: "e1a986a0-369d-47b7-b418-bb5796911828",
    name: "Reforzamiento + Nivelación + Semipermanente",
    price: 550,
    duration: "120 min",
    description: "Aplica una capa de material más duro (Rubber Base o Acrígel) para dar resistencia a la uña natural, corregir imperfecciones y esmaltar.",
    color: "bg-pink-100",
    isAddon: false
  },
  {
    id: "b0bc6707-c4b1-49d3-948d-62702f0199f6",
    name: "Esculturales Híbridas con Polygel",
    price: 700,
    duration: "120 min",
    description: "Creación de extensiones de uñas (sin tip) usando Polygel, un material ligero y resistente, para un look más natural y duradero.",
    color: "bg-teal-100",
    isAddon: false
  },
  // Servicios Adicionales (addons)
  {
    id: 5,
    name: "Tratamiento con Vitamina E",
    price: 100,
    duration: "15 min",
    description: "Tratamiento de hidratación intensiva para cutículas y piel, promoviendo uñas saludables.",
    color: "bg-amber-100",
    isAddon: true
  },
  {
    id: 6,
    name: "Cada diseño adicional",
    price: 50,
    duration: "15 min",
    description: "Costo por diseño complejo o extra en uñas individuales (ej. mano alzada, pedrería).",
    color: "bg-cyan-100",
    isAddon: true
  },
  {
    id: 7,
    name: "Retirado de material",
    price: 100,
    duration: "30 min",
    description: "Remoción segura de esmalte semipermanente, acrílico o gel, para evitar dañar la uña natural.",
    color: "bg-gray-100",
    isAddon: true
  }
];*/

//Quitamos los servicios en duro y solo dejamos los addons


// ✅ Addons se quedan fijos por ahora
const ADDONS = [
  {
    id: 5,
    name: "Tratamiento con Vitamina E",
    price: 100,
    duration: "15 min",
    description: "Tratamiento de hidratación intensiva para cutículas y piel, promoviendo uñas saludables.",
    color: "bg-amber-100",
    isAddon: true
  },
  {
    id: 6,
    name: "Cada diseño adicional",
    price: 50,
    duration: "15 min",
    description: "Costo por diseño complejo o extra en uñas individuales (ej. mano alzada, pedrería).",
    color: "bg-cyan-100",
    isAddon: true
  },
  {
    id: 7,
    name: "Retirado de material",
    price: 100,
    duration: "30 min",
    description: "Remoción segura de esmalte semipermanente, acrílico o gel, para evitar dañar la uña natural.",
    color: "bg-gray-100",
    isAddon: true
  }
];
const SERVICE_COLORS = ["bg-rose-100", "bg-purple-100", "bg-pink-100", "bg-teal-100", "bg-amber-100"];



// Horarios de 9:00 a 18:00 (6 PM) -- esto solo va cuando quiero representar datos sin
const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", 
  "17:00", "18:00" 
];

const getNextDays = () => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateISO = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    days.push({
      fullDate: date,
      dayName: date.toLocaleDateString("es-ES", { weekday: "short" }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString("es-ES", { month: "short" }),
      dateISO,
    });
  }

  return days;
};



// SVG del logo (flor/mariposa) basado en la imagen
const LogoSVG = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    className={className} 
    fill="none" 
    stroke="currentColor"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: 'rotate(20deg)' }}
  >
    <path 
      className="text-rose-400" 
      d="M 50 10 C 70 30, 85 20, 90 40 C 95 60, 75 75, 50 80 L 50 10"
      fill="none"
      stroke="currentColor"
    />
    <path 
      className="text-rose-400" 
      d="M 50 10 C 30 30, 15 20, 10 40 C 5 60, 25 75, 50 80"
      fill="none"
      stroke="currentColor"
    />
  </svg>
);//


// --- COMPONENTES INTERNOS ---

//-- Es la parte de busqueda con IA --//
const AiAssistantCard = ({ 
  showAiAssistant, 
  setShowAiAssistant, 
  aiPrompt, 
  setAiPrompt, 
  handleAiSubmit, 
  isAiLoading, 
  aiSuggestion, 
  setAiSuggestion, 
  aiImage,
  setAiImage,
  aiError 
}) => {
  if (!showAiAssistant) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl border border-rose-200 p-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-gradient-to-br from-rose-200 to-purple-200 rounded-full opacity-20 blur-xl pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="text-purple-500" size={18} /> 
            Asistente de Estilo IA
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            ¿Indecisa? Cuéntame para qué ocasión son tus uñas.
          </p>
        </div>
        <button 
          onClick={() => setShowAiAssistant(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      {!aiSuggestion ? (
        <form onSubmit={handleAiSubmit} className="relative z-10">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ej: Boda de día con vestido verde..."
              className="flex-1 text-sm p-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-purple-200 outline-none bg-white/80"
            />
            <button 
              type="submit"
              disabled={isAiLoading || !aiPrompt.trim()}
              className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              {isAiLoading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> : <Wand2 size={18} />}
            </button>
          </div>
          {isAiLoading && <p className="text-xs text-purple-600 mt-2 animate-pulse">Generando sugerencia y una imagen de ejemplo...</p>}
          {aiError && <p className="text-xs text-red-500 mt-2">{aiError}</p>}
        </form>
      ) : (
        <div className="relative z-10 animate-fade-in">
          <div className="bg-white/80 p-3 rounded-xl text-sm text-gray-700 border border-rose-100 italic leading-relaxed">
            "{aiSuggestion}"
          </div>
          {aiImage && (
            <div className="mt-4 relative">
              <img 
                src={aiImage} 
                alt="Sugerencia de estilo de uñas" 
                className="w-full h-48 object-cover rounded-xl border border-rose-100 shadow-sm"
              />
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                <Image size={12} /> Sugerencia IA
              </div>
            </div>
          )}
          <button 
            onClick={() => { setAiSuggestion(''); setAiImage(''); setAiError(''); setAiPrompt(''); }}
            className="text-xs text-purple-600 font-medium mt-2 hover:underline"
          >
            Hacer otra consulta
          </button>
        </div>
      )}
    </div>
  );
};

// Se agregó 'setStep' a los props para poder avanzar al paso 2.
//Paso 1: Seleccionar Servicio Principal
const StepServices = ({ mainServices, addOns, handleServiceSelect, showAiAssistant, setShowAiAssistant, aiProps, bookingData, setBookingData, setStep }) => {
  //const mainServices = SERVICES.filter(s => !s.isAddon);
  //const addOns = SERVICES.filter(s => s.isAddon);
  
  // Manejador para seleccionar/deseleccionar un servicio adicional
  const handleAddonToggle = (addon) => {
    setBookingData(prevData => {
      const isSelected = prevData.addOns.some(a => a.id === addon.id);
      let newAddons;
      if (isSelected) {
        // Deseleccionar
        newAddons = prevData.addOns.filter(a => a.id !== addon.id);
      } else {
        // Seleccionar
        newAddons = [...prevData.addOns, addon];
      }
      return { ...prevData, addOns: newAddons };
    });
  };

  // Botón de continuar: solo se activa si se ha seleccionado un servicio principal
  const isContinueEnabled = !!bookingData.service;

  return (
    <div className="animate-fade-in">
     
      <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">1. Elige tu servicio principal</h2>
      <p className="text-gray-500 mb-6">Selecciona la base de tu manicura. Luego podrás agregar extras.</p>
      
      {!showAiAssistant && (
        <button 
          onClick={() => setShowAiAssistant(true)}
          className="w-full mb-6 py-3 px-4 bg-gradient-to-r from-purple-500 to-rose-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={18} /> ¿No sabes qué elegir? Pregúntale a la IA
        </button>
      )}

      <AiAssistantCard 
        showAiAssistant={showAiAssistant} 
        setShowAiAssistant={setShowAiAssistant}
        {...aiProps}
      />
      
      {/* SERVICIOS PRINCIPALES: Se mantiene md:grid-cols-2 como el usuario solicitó */}
      <div className="grid gap-1 md:grid-cols-2"> 
        {mainServices.map((service) => {
          const isSelected = bookingData.service?.id === service.id;
          return (
            <button
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className={`group relative flex flex-col items-start p-6 bg-white border rounded-2xl shadow-sm transition-all text-left ${
                isSelected 
                  ? 'border-rose-500 ring-4 ring-rose-100 shadow-lg' 
                  : 'border-rose-100 hover:shadow-md hover:border-rose-300'
              }`}
            >
              <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${service.color} text-gray-700`}>
                {isSelected ? <Check size={16} className="text-rose-600" /> : <Scissors size={16} />}
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-rose-600 transition-colors">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 mb-3">{service.description}</p>
              <div className="flex items-center gap-4 w-full mt-auto pt-3 border-t border-gray-50">
                <span className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                  <Clock size={14} className="mr-1" /> {service.duration}
                </span>
                <span className="text-lg font-bold text-rose-600 ml-auto">
                  {CURRENCY_SYMBOL}{service.price}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <h3 className="text-xl font-serif font-bold text-gray-800 mt-10 mb-4 flex items-center gap-2">
        <PlusSquare size={20} className="text-rose-500" /> 2. Agrega servicios adicionales
      </h3>
      <p className="text-gray-500 mb-4">Marca los extras que desees sumar a tu cita.</p>

      {/* SERVICIOS ADICIONALES: Se dejó como ancho completo (eliminado md:grid-cols-2) */}
      <div className="grid gap-4">
        {addOns.map((addon) => {
          const isSelected = bookingData.addOns.some(a => a.id === addon.id);
          return (
            <div
              key={addon.id}
              onClick={() => handleAddonToggle(addon)}
              className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex-shrink-0 mt-1 mr-3">
                <div className={`w-5 h-5 border rounded flex items-center justify-center ${isSelected ? 'bg-rose-500 border-rose-600 text-white' : 'border-gray-400 bg-white'}`}>
                  {isSelected && <Check size={14} />}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-800 leading-tight">{addon.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
              </div>
              <span className="ml-4 font-bold text-sm text-rose-600 flex-shrink-0">
                +{CURRENCY_SYMBOL}{addon.price}
              </span>
            </div>
          );
        })}
      </div>
      
      <button
        onClick={() => { if (isContinueEnabled) setStep(2); }}
        disabled={!isContinueEnabled}
        className="w-full mt-8 py-4 px-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar con fecha y hora
      </button>
    </div>
  );
};
//Paso 2: Seleccionar el dia y la hora
const StepDateTime = ({ setStep, availableDays, handleDateTimeSelect, serviceId }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateISO, setDateISO] = useState("");
  const [hours, setHours] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [hoursError, setHoursError] = useState("");

    const toISODate = (d) => {
      // d puede ser Date o string YYYY-MM-DD
      if (!d) return "";
      if (typeof d === "string") return d;

      return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-");
    };

  const loadAvailability = async (day) => {
    if (!serviceId) {
      setHours([]);
      setHoursError("Primero selecciona un servicio.");
      return;
    }

    const iso = toISODate(day.fullDate);
    setDateISO(iso);
    setHoursError("");
    setLoadingHours(true);

    try {
      const url = `${API_BASE_URL}/availability?date=${encodeURIComponent(iso)}&service_id=${encodeURIComponent(serviceId)}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "No pudimos cargar horarios.");
      }

      setHours(data?.hours ?? []);
    } catch (err) {
      setHours([]);
      setHoursError(err?.message || "Error cargando horarios.");
    } finally {
      setLoadingHours(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => setStep(1)}
        className="mb-4 text-sm text-gray-500 hover:text-rose-600 flex items-center"
      >
        <ChevronLeft size={16} className="mr-1" /> Volver a servicios
      </button>

      <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">3. Agenda tu cita</h2>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Selecciona un día</h3>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {availableDays.map((day, idx) => {
            const isSelected =
              selectedDate?.fullDate.toDateString() === day.fullDate.toDateString();

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDate(day);
                  loadAvailability(day);
                }}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-rose-500 border-rose-600 text-white shadow-lg scale-105"
                    : "bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50"
                }`}
              >
                <span className="text-xs font-medium uppercase mb-1">{day.dayName}</span>
                <span className="text-xl font-bold">{day.dayNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`transition-opacity duration-500 ${
          selectedDate ? "opacity-100" : "opacity-30 pointer-events-none"
        }`}
      >
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
          Horarios disponibles (9:00 - 18:00)
        </h3>

        {hoursError && (
          <div className="p-3 mb-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {hoursError}
          </div>
        )}

        {loadingHours ? (
          <div className="text-sm text-gray-500">Cargando horarios...</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {(hours ?? []).map((h) => (
              <button
                key={h.start_min}
                disabled={!h.available}
                onClick={() => handleDateTimeSelect(selectedDate, h.time_local, dateISO)}
                className={`py-3 px-4 rounded-xl border font-medium transition-all focus:ring-2 focus:ring-rose-200
                  ${
                    h.available
                      ? "border-gray-200 text-gray-700 hover:bg-rose-500 hover:text-white hover:border-rose-600"
                      : "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
                  }`}
              >
                {h.time_local}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

//Paso 3: Confirmar cita en el formulario.
const StepForm = ({ bookingData, setBookingData, setStep, handleSubmit, isSending, sendError, totalCost }) => (
  <div className="animate-fade-in">
    <button 
      onClick={() => setStep(2)} 
      className="mb-4 text-sm text-gray-500 hover:text-rose-600 flex items-center"
    >
      <ChevronLeft size={16} className="mr-1" /> Volver al calendario
    </button>

    <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">4. Finalizar Reserva</h2>

    <div className="bg-rose-50 rounded-2xl p-6 mb-8 border border-rose-100">
      <h3 className="text-rose-800 font-bold mb-4 flex items-center">
        <Star size={18} className="mr-2" /> Resumen de tu cita
      </h3>
      <div className="space-y-3 text-gray-700">
        <div className="flex justify-between items-center pb-2 border-b border-rose-100">
          <span className="text-sm text-gray-500">Servicio Principal</span>
          <span className="font-medium">
            {bookingData.service?.name} ({CURRENCY_SYMBOL}{bookingData.service?.price})
          </span>
        </div>

        {bookingData.addOns.length > 0 && (
          <div className="pb-2">
            <span className="text-xs font-bold uppercase text-gray-500 mb-1 block">Extras:</span>
            {bookingData.addOns.map(addon => (
              <div key={addon.id} className="flex justify-between items-center text-sm italic text-gray-600 pl-4">
                <span>- {addon.name}</span>
                <span>+{CURRENCY_SYMBOL}{addon.price}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Fecha</span>
          <span className="font-medium capitalize">
            {bookingData.date?.dayName}, {bookingData.date?.dayNumber} de {bookingData.date?.month}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Hora</span>
          <span className="font-medium">{bookingData.time} hrs</span>
        </div>
        
        <div className="border-t border-rose-200 mt-4 pt-3 flex justify-between items-center text-xl font-extrabold text-rose-600">
          <span>TOTAL A PAGAR</span>
          <span>{CURRENCY_SYMBOL}{totalCost}</span>
        </div>
      </div>
    </div>

    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre</label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            required
            type="text"
            placeholder="Ej. María Pérez"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            value={bookingData.clientName}
            onChange={(e) => setBookingData({...bookingData, clientName: e.target.value})}
            disabled={isSending}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            required
            type="email"
            placeholder="ejemplo@correo.com"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            value={bookingData.clientEmail}
            onChange={(e) => setBookingData({...bookingData, clientEmail: e.target.value})}
            disabled={isSending}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            required
            type="tel"
            placeholder="Ej. 9900 1234"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            value={bookingData.clientPhone}
            onChange={(e) => setBookingData({...bookingData, clientPhone: e.target.value})}
            disabled={isSending}
          />
        </div>
      </div>

      {sendError && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
           <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
           <span>{sendError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSending}
        className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transform hover:-translate-y-1 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSending ? (
          <>Enviando... <Loader2 size={20} className="animate-spin" /></>
        ) : (
          <>Confirmar Reserva <Mail size={20} /></>
        )}
      </button>
      
      {isSending && (
        <p className="text-xs text-center text-rose-500 animate-pulse">
          Procesando tu reserva...
        </p>
      )}
    </form>
  </div>
);
//Paso 4: Confirmacion exitosa de cita
const StepSuccess = ({ bookingData, resetApp, isSimulation, totalCost }) => (
  <div className="text-center animate-fade-in py-10">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
      <Check size={40} strokeWidth={3} />
    </div>
    <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">¡Reserva Exitosa!</h2>
    <p className="text-gray-500 mb-8 max-w-xs mx-auto">
      La confirmación ha sido enviada a <strong>{bookingData.clientEmail || 'tu correo'}</strong>. El total es de **{CURRENCY_SYMBOL}{totalCost}**.
    </p>
    
    {isSimulation && (
      <div className="mb-6 mx-auto max-w-sm p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-200 flex items-center gap-2">
        <AlertCircle size={16} />
        <span><strong>Modo Prueba:</strong> El correo no se envió realmente porque faltan configurar las claves de EmailJS.</span>
      </div>
    )}
    
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 text-left max-w-sm mx-auto">
      <p className="text-xs text-gray-400 uppercase font-bold mb-2">Detalles</p>
      <p className="text-sm text-gray-700"><span className="font-bold">Cliente:</span> {bookingData.clientName}</p>
      <p className="text-sm text-gray-700"><span className="font-bold">Servicio:</span> {bookingData.service?.name}</p>
      {bookingData.addOns.length > 0 && (
        <p className="text-sm text-gray-700"><span className="font-bold">Extras:</span> {bookingData.addOns.map(a => a.name).join(', ')}</p>
      )}
      <p className="text-sm text-gray-700"><span className="font-bold">Fecha:</span> {bookingData.dateISO}</p>
      <p className="text-sm text-gray-700"><span className="font-bold">Hora:</span> {bookingData.time}</p>
      <p className="text-lg text-gray-800 font-extrabold mt-2"><span className="font-normal">Total:</span> {CURRENCY_SYMBOL}{totalCost}</p>
    </div>

    <button
      onClick={resetApp}
      className="bg-rose-500 text-white font-medium py-3 px-8 rounded-full hover:bg-rose-600 transition-colors shadow-md"
    >
      Hacer otra reserva
    </button>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    service: null,
    addOns: [], // Nueva propiedad para almacenar add-ons seleccionados
    date: null,
    time: null,
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  });
const [mainServices, setMainServices] = useState([]);
const [servicesLoading, setServicesLoading] = useState(true);
const [servicesError, setServicesError] = useState("");

useEffect(() => {
  (async () => {
    try {
      setServicesLoading(true);
      setServicesError("");

      const apiServices = await getServices();

      const onlyActive = apiServices.filter(s => s.is_active);

      const mapped = onlyActive.map((s, idx) => ({
        id: s.id,
        name: s.name,
        price: s.price == null ? 0 : Number(s.price), // Prisma suele devolver string
        duration: `${s.duration_min} min`,
        description: "", // si luego quieres, lo llenamos desde DB
        color: SERVICE_COLORS[idx % SERVICE_COLORS.length],
        isAddon: false,
      }));

      setMainServices(mapped);
    } catch (err) {
      setServicesError(err?.message || String(err));
    } finally {
      setServicesLoading(false);
    }
  })();
}, []);

  // Estado de envío
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [isSimulation, setIsSimulation] = useState(false);
  
  // Estados IA
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiImage, setAiImage] = useState(''); 
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const availableDays = getNextDays();
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Inyectada por el entorno

  // Función para calcular el costo total
  const totalCost = useMemo(() => {
    const servicePrice = bookingData.service?.price || 0;
    const addOnsTotal = bookingData.addOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return servicePrice + addOnsTotal;
  }, [bookingData.service, bookingData.addOns]);


  // Función para generar una imagen (Implementación con API)
  const generateImage = async (prompt) => {
    // Implementación con retroceso exponencial (Exponential Backoff)
      const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errText = await response.text(); // <-- CLAVE
          throw new Error(`HTTP ${response.status} - ${errText}`);
        }

        return await response.json();
      } catch (error) {
        if (retries > 0) {
          await new Promise(r => setTimeout(r, backoff));
          return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
      }
    };


    //const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict";
    // Parámetros para generar una imagen de alta calidad, realista y vertical (3:4)
      const payload = {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: "3:4" }
    };

    try {
        /*const result = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });*/

        const result = await fetchWithRetry(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });
              
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            const base64Data = result.predictions[0].bytesBase64Encoded;
            return `data:image/png;base64,${base64Data}`;
        } else {
            console.error("Fallo al generar imagen: No se encontraron datos base64.");
            return null;
        }

    } catch (error) {
        console.error("Error durante la llamada a la API de Imagen:", error);
        return null; 
    }
  };

  // Función para generar texto y luego la imagen con la IA
  const callGeminiAPI = async (promptText) => {
    setIsAiLoading(true);
    setAiSuggestion('');
    setAiImage(''); 
    setAiError('');

    const systemPromptText = `
      Eres una experta manicurista y estilista de uñas del salón "Amazing Nails". 
      Tu objetivo es recomendar uno de los siguientes servicios principales basándote en la descripción de la clienta:
      ${SERVICES.filter(s => !s.isAddon).map(s => `- ${s.name}: ${s.description}`).join('\n')}
      
      Instrucciones:
      1. Sugiere un diseño o color específico que combine con la ocasión o mood que describe la usuaria.
      2. Recomienda cuál de los servicios de la lista principal es el mejor para lograr ese look.
      3. Sé breve (máximo 3 oraciones), amable y utiliza emojis.
      4. Responde siempre en Español.
    `;

    const imagePromptBase = `Uñas decoradas, estilo manicura de mujer elegante, primer plano de manos femeninas, alta calidad, fotorrealista, estilo profesional de salón de belleza.`;


    try {
      // Función auxiliar para reintentar la llamada a la API
      const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
        try {
          const response = await fetch(url, options);

          // Lee el body UNA sola vez
          const raw = await response.text();

          // Intenta parsear JSON
          let data;
          try {
            data = raw ? JSON.parse(raw) : null;
          } catch {
            data = raw; // si no es JSON, dejamos texto
          }

          if (!response.ok) {
            // No reintentes errores de permisos / payload
            if ([400, 401, 403].includes(response.status)) {
              throw new Error(`Error HTTP: ${response.status} - ${raw}`);
            }
            // Solo reintenta 429 o 5xx
            if (retries > 0 && (response.status === 429 || response.status >= 500)) {
              await new Promise(r => setTimeout(r, backoff));
              return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw new Error(`Error HTTP: ${response.status} - ${raw}`);
          }

          return data;
        } catch (error) {
          // errores de red
          if (retries > 0) {
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
          }
          throw error;
        }
      };


      // 1. Generar la sugerencia de texto
      const textData = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent`,
        {
          method: 'POST',
          headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey,
                  },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: systemPromptText }] }
          })
        }
      );

      const suggestionText = textData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (suggestionText) {
        setAiSuggestion(suggestionText);

        // 2. Si el texto se generó, pedir una imagen basada en la sugerencia
        const imagePrompt = `${imagePromptBase} Basado en la sugerencia: "${suggestionText}".`;
        
        try {
           const imageData = await generateImage(imagePrompt);
           if (imageData) {
               setAiImage(imageData);
           } else {
               setAiError("No pude generar una imagen de ejemplo, pero aquí está la sugerencia:");
           }
        } catch (imageError) {
            setAiError("No pude generar una imagen de ejemplo, pero aquí está la sugerencia:");
        }

      } else {
        throw new Error("No se pudo generar una sugerencia de texto.");
      }

    } catch (error) {
      console.error("Error al llamar a Gemini:", error);
      setAiError("Lo siento, mi intuición de estilista está descansando. Intenta de nuevo.");
    } finally {
      setIsAiLoading(false);
    }
  };


  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    callGeminiAPI(aiPrompt);
  };

  const handleServiceSelect = (service) => {
    setBookingData(prevData => ({
        ...prevData, 
        service: prevData.service?.id === service.id ? null : service, // Toggle selection
        // Si cambia el servicio principal, limpiar los addons por precaución, o dejarlos si son universales
    }));
  };

  const timeToStartMin = (time) => {
  // "09:00" -> 540
  const [hh, mm] = time.split(":").map(Number);
  return (hh * 60) + (mm || 0);
};
const handleDateTimeSelect = (selectedDate, time, dateISO) => {
  if (!selectedDate) return;
  if (!dateISO) {
    const d = selectedDate.fullDate;
    dateISO = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  }

  setBookingData((prev) => ({
    ...prev,
    date: selectedDate,          // UI
    time,                        // "09:00"
    dateISO,                     // "YYYY-MM-DD"
    start_min: timeToStartMin(time), // ✅ para /bookings2
  }));

  setStep(3); // tu step de resumen / finalizar
};

  const EMAIL_NOTIFICATIONS_ENABLED = false; // ⛔ por ahora NO enviar EmailJS (solo reservar)
  // --- LÓGICA DE ENVÍO CON API DE EMAILJS ---
 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSending(true);
  setSendError("");

  // ========= 🔒 EmailJS (NO borrar, solo “apagado”) =========
    // Dejo tu código intacto en una función interna.
      const sendEmailWithEmailJS = async () => {
      // --- MODO SIMULACIÓN (tu lógica original) ---
      if (
        EMAILJS_SERVICE_ID.includes("service_id_aqui") ||
        EMAILJS_PUBLIC_KEY.includes("public_key_aqui")
      ) {
        // Simula éxito de envío
        await new Promise((r) => setTimeout(r, 1500));
        return { simulated: true };
      }

    const addOnsList =
      bookingData.addOns?.map((a) => `${a.name} (${CURRENCY_SYMBOL}${a.price})`).join(", ") ||
      "Ninguno";

    const templateParams = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: bookingData.clientEmail,
        client_name: bookingData.clientName,
        client_email: bookingData.clientEmail,
        client_phone: bookingData.clientPhone,
        service_name: bookingData.service?.name,
        service_addons: addOnsList,
        service_price: `${CURRENCY_SYMBOL}${totalCost}`,
        date_day: bookingData.date?.dayName,
        date_number: bookingData.date?.dayNumber,
        date_month: bookingData.date?.month,
        time_slot: bookingData.time,
      },
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateParams),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Error de conexión con el servidor de correo.");
    }

    return { ok: true };
  };
  // ========= /EmailJS =========

  try {
    // ✅ 1) Crear reserva en tu API (booking2)
    // Requiere que guardes bookingData.dateISO = "YYYY-MM-DD"
    const booking_date = bookingData.dateISO;
    if (!booking_date) throw new Error("Falta bookingData.dateISO (YYYY-MM-DD).");

    if (!bookingData.service?.id) throw new Error("Falta service_id.");
    if (!bookingData.time) throw new Error("Falta hora seleccionada.");
    if (!bookingData.clientName || !bookingData.clientEmail || !bookingData.clientPhone) {
      throw new Error("Completa nombre, correo y teléfono.");
    }
    if (typeof bookingData.start_min !== "number") {
       throw new Error("Falta start_min (selecciona una hora disponible).");
       }
    console.log("SERVICE OBJ:", bookingData.service);
    console.log("SERVICE ID:", bookingData.service?.id, typeof bookingData.service?.id);
    console.log("SUBMIT DATA", {
      service_id: bookingData.service?.id,
      booking_date: bookingData.dateISO,
      time_local: bookingData.time,
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
    });
    
  
    // 👇 llama tu endpoint /bookings2
    await createBooking2({
      service_id: bookingData.service.id,
      booking_date: bookingData.dateISO,                // "YYYY-MM-DD"
      time_local: bookingData.time,  // "09:00"
      start_min: bookingData.start_min, // ✅ usa el que ya guardaste
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
    });

    // ✅ 2) (opcional) EmailJS después (apagado por ahora)
    if (EMAIL_NOTIFICATIONS_ENABLED) {
      await sendEmailWithEmailJS();
    }

    // ✅ 3) avanzar a confirmación
    setIsSimulation(false);
    setStep(4);
  } catch (error) {
    console.error("Error en handleSubmit:", error);
    setSendError(`No pudimos completar la reserva. Detalle: ${error.message || error}`);
  } finally {
    setIsSending(false);
  }
};

  const resetApp = () => {
    setBookingData({
      service: null,
      addOns: [],
      date: null,
      time: null,
      clientName: '',
      clientEmail: '',
      clientPhone: ''
    });
    setAiSuggestion('');
    setAiImage('');
    setAiPrompt('');
    setShowAiAssistant(false);
    setSendError('');
    setIsSimulation(false);
    setStep(1);
  };

  const aiProps = {
    aiPrompt,
    setAiPrompt,
    handleAiSubmit,
    isAiLoading,
    aiSuggestion,
    setAiSuggestion,
    aiImage, 
    setAiImage, 
    aiError
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-rose-200">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            
           <img
              src={logoimg}
              alt="Logo"
              className="w-25 h-25 object-contain"
           />
            <span className="font-serif text-xl font-bold text-gray-800 tracking-tight">Agendamiento</span>
          </div>
          {step < 4 && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-rose-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-rose-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-1 rounded-full ${step >= 3 ? 'bg-rose-500' : 'bg-gray-200'}`}></div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        {step === 1 && (
          <StepServices 
            mainServices={mainServices}
            addOns={ADDONS}
            handleServiceSelect={handleServiceSelect}
            showAiAssistant={showAiAssistant}
            setShowAiAssistant={setShowAiAssistant}
            aiProps={aiProps}
            bookingData={bookingData}
            setBookingData={setBookingData}
            setStep={setStep}
          />
        )}
        {step === 2 && (
          <StepDateTime 
            setStep={setStep}
            availableDays={availableDays}
            handleDateTimeSelect={handleDateTimeSelect}
            serviceId={bookingData.service?.id}
          />
        )}
        {step === 3 && (
          <StepForm 
            bookingData={bookingData}
            setBookingData={setBookingData}
            setStep={setStep}
            handleSubmit={handleSubmit}
            isSending={isSending}
            sendError={sendError}
            totalCost={totalCost} // Pasar el costo total
          />
        )}
        {step === 4 && (
          <StepSuccess 
            bookingData={bookingData}
            resetApp={resetApp}
            isSimulation={isSimulation}
            totalCost={totalCost} // Pasar el costo total
          />
        )}
      </main>

      <footer className="text-center text-gray-400 text-sm py-8">
        <p className="flex items-center justify-center gap-1">
          <MapPin size={14} /> Barrio el Centro, calle Vicente Williams, Plaza Isabelle
                                Choluteca, Choluteca
        </p>
        <p className="mt-2">© {new Date().getFullYear()} Amazing Nails Nail Care Studio</p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
}