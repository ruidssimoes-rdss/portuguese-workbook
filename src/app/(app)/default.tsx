import { notFound } from "next/navigation";

/** A path only the header/panel slots match is not a page. */
export default function NoPage() {
  notFound();
}
