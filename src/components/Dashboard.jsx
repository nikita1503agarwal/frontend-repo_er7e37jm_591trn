import { useEffect, useState } from 'react'
import { CalendarDays, ClipboardList, Bell, BookOpenCheck, Users, Clock } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''
const USER_ID = 'demo-student-1' // demo user

function Section({ title, icon, children, action }) {
  const Icon = icon
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-400"/>
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function Dashboard(){
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [exams, setExams] = useState([])
  const [events, setEvents] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        const [c,a,e,ev,at] = await Promise.all([
          fetch(`${API_BASE}/api/schedule/${USER_ID}`).then(r=>r.json()),
          fetch(`${API_BASE}/api/assignments?user_id=${USER_ID}`).then(r=>r.json()),
          fetch(`${API_BASE}/api/exams?user_id=${USER_ID}`).then(r=>r.json()),
          fetch(`${API_BASE}/api/events`).then(r=>r.json()),
          fetch(`${API_BASE}/api/attendance/${USER_ID}`).then(r=>r.json()),
        ])
        setCourses(c)
        setAssignments(a)
        setExams(e)
        setEvents(ev)
        setAttendance(at)
      } finally {
        setLoading(false)
      }
    }
    load()
  },[])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Academic Hub</h1>
          <p className="text-slate-300 text-sm">All your academic info in one place</p>
        </div>
        <div className="text-slate-300 text-sm">Signed in as demo student</div>
      </div>

      {loading ? (
        <div className="text-slate-300">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Class Schedule" icon={CalendarDays}>
            {courses.length === 0 ? (
              <p className="text-slate-300 text-sm">No courses yet.</p>
            ) : (
              <ul className="space-y-2">
                {courses.map(c => (
                  <li key={c.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                    <div>
                      <div className="text-white font-medium">{c.code} · {c.name}</div>
                      <div className="text-slate-400 text-xs">{(c.schedule||[]).join(' • ')}</div>
                    </div>
                    <Clock className="w-4 h-4 text-slate-400"/>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Assignments" icon={ClipboardList}>
            {assignments.length === 0 ? (
              <p className="text-slate-300 text-sm">No upcoming assignments.</p>
            ) : (
              <ul className="space-y-2">
                {assignments.map(a => (
                  <li key={a.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                    <div>
                      <div className="text-white font-medium">{a.title}</div>
                      <div className="text-slate-400 text-xs">Due {new Date(a.due_date).toLocaleDateString()}</div>
                    </div>
                    <BookOpenCheck className="w-4 h-4 text-emerald-400"/>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Exams" icon={Users}>
            {exams.length === 0 ? (
              <p className="text-slate-300 text-sm">No upcoming exams.</p>
            ) : (
              <ul className="space-y-2">
                {exams.map(e => (
                  <li key={e.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                    <div>
                      <div className="text-white font-medium">{e.title}</div>
                      <div className="text-slate-400 text-xs">{new Date(e.exam_date).toLocaleDateString()} {e.location?`• ${e.location}`:''}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Campus Events" icon={Bell}>
            {events.length === 0 ? (
              <p className="text-slate-300 text-sm">No events.</p>
            ) : (
              <ul className="space-y-2">
                {events.map(ev => (
                  <li key={ev.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                    <div>
                      <div className="text-white font-medium">{ev.title}</div>
                      <div className="text-slate-400 text-xs">{new Date(ev.event_date).toLocaleString()} {ev.location?`• ${ev.location}`:''}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Attendance" icon={Users}>
            {attendance.length === 0 ? (
              <p className="text-slate-300 text-sm">No attendance records yet.</p>
            ) : (
              <ul className="space-y-2">
                {attendance.map(at => (
                  <li key={at.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                    <div>
                      <div className="text-white font-medium">{at.course_id} · {at.status}</div>
                      <div className="text-slate-400 text-xs">{new Date(at.date).toLocaleDateString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Notifications" icon={Bell}>
            <Notifications />
          </Section>
        </div>
      )}
    </div>
  )
}

function Notifications(){
  const [items, setItems] = useState([])
  useEffect(()=>{
    fetch(`${API_BASE}/api/notifications/${USER_ID}`).then(r=>r.json()).then(setItems)
  },[])
  return (
    <ul className="space-y-2">
      {items.length === 0 ? (
        <p className="text-slate-300 text-sm">You're all caught up.</p>
      ) : items.map(n => (
        <li key={n.id} className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
          <div className="text-white font-medium">{n.title}</div>
          <div className="text-slate-400 text-xs">{n.message}</div>
        </li>
      ))}
    </ul>
  )
}
