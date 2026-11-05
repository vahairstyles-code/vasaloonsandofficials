import useFetch from '../../hooks/useFetch';
import { Empty, ErrorBox, Spinner } from '../../components/ui';

export default function Audit() {
  const { data, loading, error, reload } = useFetch('/admin/audit');
  return (
    <div>
      <h1 className="font-serif text-3xl">Audit log</h1>
      <div className="mt-6 overflow-x-auto">{loading ? <Spinner /> : error ? <ErrorBox onRetry={reload}>{error}</ErrorBox> : !data.length ? <Empty>No activity yet.</Empty> : (
        <table className="w-full min-w-[600px] text-left text-sm"><thead className="text-[11px] uppercase tracking-wider text-mute"><tr><th className="py-3 font-normal">When</th><th className="font-normal">Admin</th><th className="font-normal">Action</th><th className="font-normal">Item</th></tr></thead>
          <tbody>{data.map((a) => <tr key={a._id} className="border-t border-white/5"><td className="py-2.5 text-xs text-mute">{new Date(a.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td><td>{a.admin}</td><td>{a.action}</td><td className="text-xs text-mute">{a.entity} {a.entityId}</td></tr>)}</tbody></table>
      )}</div>
    </div>
  );
}
