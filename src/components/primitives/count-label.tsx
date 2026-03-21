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
    <div className="text-[12px] text-[#9B9DA3] mt-3 px-1">
      Showing {showing} of {total}{noun ? ` ${noun}` : ""}
    </div>
  );
}
