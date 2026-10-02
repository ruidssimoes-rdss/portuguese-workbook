/**
 * CountLabel — "Showing X of Y" text below lists.
 *
 * <CountLabel showing={10} total={52} noun="words" />
 */

interface CountLabelProps {
  showing: number;
  total: number;
  noun?: string;
}

export function CountLabel({ showing, total, noun }: CountLabelProps) {
  return (
    <div className="text-[11.5px] text-aula-text-3 mt-3 px-1">
      {showing} de {total}{noun ? ` ${noun}` : ""}
    </div>
  );
}
