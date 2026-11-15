export default function Feedback({ error, success }) {
  return <>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    {success && <div className="alert alert-success" role="status">{success}</div>}
  </>;
}
