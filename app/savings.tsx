import benefits from './lib/savings.json';
const records:Record<string,{label:string;detail:string;source:string;checkedAt:string}>=benefits;
export function SavingsBadge({id}:{id:string}){const b=records[id];return b?<span className="saving-badge">✦ {b.label}</span>:null}
export function SavingsDetails({id}:{id:string}){const b=records[id];return b?<details className="saving-details"><summary>💸 {b.label}<span>Ver cómo aprovecharlo</span></summary><p>{b.detail}</p><a href={b.source} target="_blank" rel="noreferrer">Condiciones oficiales ↗</a><small>Revisado el 8/11/2026 · Beneficio del proveedor, independiente de YOLO Plus. Confirmá vigencia y disponibilidad antes de ir.</small></details>:null}
