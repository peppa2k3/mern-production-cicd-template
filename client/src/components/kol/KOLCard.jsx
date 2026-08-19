import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function KOLCard({ kol }) {
  return (
    <Link
      to={`/kol/${kol.route}`}
      className="group flex flex-col items-center rounded-xl2 border border-border bg-base-800 p-6 text-center transition-colors hover:border-gold-500/40"
    >
      <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-gold-500/40 bg-base-700">
        <img
          src={kol.avatar || 'https://placehold.co/200x200'}
          alt={kol.displayName}
          className="h-full w-full object-cover"
        />
      </div>
      <h3 className="mt-3 font-display font-semibold text-ink-100 group-hover:text-gold-400">
        {kol.displayName}
      </h3>
      {kol.bio && <p className="mt-1 line-clamp-2 text-xs text-ink-500">{kol.bio}</p>}
      <div className="mt-3 flex gap-2">
        {kol.socials?.facebook && <Facebook size={14} className="text-ink-700" />}
        {kol.socials?.instagram && <Instagram size={14} className="text-ink-700" />}
        {kol.socials?.youtube && <Youtube size={14} className="text-ink-700" />}
      </div>
    </Link>
  );
}
