import { useNavigate } from "react-router";
import { Construction, ArrowLeft, Clock, Bell, Sparkles } from "lucide-react";

const features = [
  { label: "Progress Monitoring", desc: "Track all students' stages and deadlines in real-time." },
  { label: "Committee Dashboard", desc: "Unified rubric scoring, averages, and committee results." },
  { label: "Final Evaluation Flow", desc: "Weighted final scores, defense notes, and signed submissions." },
];

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-6 py-12">
      
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-accent-softer border border-border rounded-3xl flex items-center justify-center shadow-sm">
          <Construction className="w-12 h-12 text-accent" />
        </div>
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-orange-500" />
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-3xl font-extrabold text-ink-900 mb-2 tracking-normal">Тун удахгүй</h2>
      <span className="inline-block bg-accent-softer border border-border text-accent text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
        In Active Development
      </span>
      <p className="text-ink-500 text-sm max-w-md mb-10 leading-relaxed">
        Энэ хэсэг одоо идэвхтэй боловсруулагдаж байна. Гүйцэтгэлийн чанарын хамт тун удахгүй гарна.
      </p>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-10">
        {features.map((f, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 text-left hover:border-accent hover:shadow-sm transition-all group">
            <div className="w-8 h-8 bg-accent-softer rounded-lg flex items-center justify-center mb-3 group-hover:bg-accent-soft transition-colors">
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-ink-900 mb-1">{f.label}</h3>
            <p className="text-xs text-ink-500 leading-snug">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Notify & Back CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-b from-[#2a5f95] to-accent text-white text-sm font-medium rounded-xl hover:from-[#326ba4] hover:to-accent-hover transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Буцах
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border text-ink-700 text-sm font-medium rounded-xl hover:bg-accent-softer hover:border-border-strong transition-colors shadow-sm">
          <Bell className="w-4 h-4 text-ink-400" />
          Мэдэгдэл авах
        </button>
      </div>

    </div>
  );
}
