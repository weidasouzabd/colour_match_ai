import { ReactNode } from 'react';

type Props = {
  title: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
};

export function KpiCard({ title, value, helper, icon }: Props) {
  return (
    <div className="card kpi-card">
      <div>
        <p className="kpi-title">{title}</p>
        <h3 className="kpi-value">{value}</h3>
        {helper ? <p className="kpi-helper">{helper}</p> : null}
      </div>
      {icon ? <div className="kpi-icon">{icon}</div> : null}
    </div>
  );
}
