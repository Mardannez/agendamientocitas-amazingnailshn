export function timeToStartMinHourOnly(time: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!match) throw new Error(`Hora inválida: ${time}. Usa HH:mm`);

  const hh = Number(match[1]);
  const mm = Number(match[2]);
  const startMin = hh * 60 + mm;

  if (startMin % 60 !== 0) throw new Error("Solo horas exactas");
  return startMin;
}
