import { Database, KeyRound, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type SchemaTableData = {
  name: string;
  columnCount: number;
  columns: string[][];
};

function KeyBadge({ k }: { k: string }) {
  if (!k) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink/55">
      <Badge
        variant="secondary"
        className="rounded border-0 bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[9.5px] font-bold"
      >
        {k}
      </Badge>
      {k === "PK" ? (
        <KeyRound size={12} className="text-amber-500" />
      ) : (
        <Link2 size={12} className="text-sky-500" />
      )}
    </span>
  );
}

export default function SchemaTable({ table }: { table: SchemaTableData }) {
  return (
    <div className="rounded-xl border border-black/[0.08] overflow-hidden">
      <div className="flex items-center justify-between bg-[#FAFAFC] px-3 py-2 border-b border-black/[0.06]">
        <span className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <Database size={14} className="text-brand" /> {table.name}
        </span>
        <span className="text-[11px] text-body">({table.columnCount} columns)</span>
      </div>
      <Table className="text-[11.5px]">
        <TableHeader>
          <TableRow className="text-body bg-white border-black/[0.05] hover:bg-white">
            <TableHead className="text-left font-semibold px-3 py-1.5 h-auto text-body">
              Column Name
            </TableHead>
            <TableHead className="text-left font-semibold px-2 py-1.5 h-auto text-body">
              Type
            </TableHead>
            <TableHead className="text-left font-semibold px-2 py-1.5 h-auto text-body">
              Key
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.columns.map(([name, type, key]) => (
            <TableRow key={name} className="border-black/[0.05] hover:bg-transparent">
              <TableCell className="px-3 py-1.5 font-mono text-ink/80">{name}</TableCell>
              <TableCell className="px-2 py-1.5 text-body">{type}</TableCell>
              <TableCell className="px-2 py-1.5">
                <KeyBadge k={key} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
