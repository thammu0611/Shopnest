export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="loader">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  )
}
