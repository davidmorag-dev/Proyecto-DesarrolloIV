export default function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  return (
    <nav
      aria-label="Páginas del listado"
      className="d-flex justify-content-end align-items-center gap-2 mt-3"
    >
      <button
        className="btn btn-outline-primary btn-sm"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
      >
        Anterior
      </button>
      <span className="small text-secondary">
        Página {current} de {total}
      </span>
      <button
        className="btn btn-outline-primary btn-sm"
        disabled={current >= total}
        onClick={() => onChange(current + 1)}
      >
        Siguiente
      </button>
    </nav>
  );
}
