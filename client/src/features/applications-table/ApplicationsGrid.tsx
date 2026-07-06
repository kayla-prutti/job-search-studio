import { useMemo } from "react";
import { Edit3, Trash2 } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type {
  Application,
  ApplicationStatus,
} from "../../shared/types/application";
import { formatCurrency } from "../../shared/utils/format";

ModuleRegistry.registerModules([AllCommunityModule]);

const gridTheme = themeQuartz.withParams({
  accentColor: "#2563eb",
  backgroundColor: "#ffffff",
  borderColor: "#e5e7eb",
  borderRadius: 8,
  browserColorScheme: "light",
  cellHorizontalPaddingScale: 1,
  columnBorder: false,
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  fontSize: 14,
  foregroundColor: "#334155",
  headerBackgroundColor: "#f8fafc",
  headerFontSize: 12,
  headerFontWeight: 700,
  headerTextColor: "#64748b",
  rowBorder: true,
  rowHoverColor: "#f8fafc",
  selectedRowBackgroundColor: "#eff6ff",
  spacing: 8,
});

type ApplicationsGridProps = {
  applications: Application[];
  error: string | null;
  isLoading: boolean;
  quickFilter: string;
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
};

export function ApplicationsGrid({
  applications,
  error,
  isLoading,
  quickFilter,
  onEdit,
  onDelete,
}: ApplicationsGridProps) {
  const columnDefs = useMemo<ColDef<Application>[]>(
    () => [
      {
        field: "role",
        headerName: "Role",
        minWidth: 230,
        pinned: "left",
        cellClass: "strong-cell",
      },
      {
        field: "company",
        headerName: "Company",
        minWidth: 170,
        valueFormatter: ({
          value,
        }: ValueFormatterParams<Application, string>) => value || "-",
      },
      {
        field: "salary",
        headerName: "Salary",
        minWidth: 140,
        type: "rightAligned",
        valueFormatter: ({
          value,
        }: ValueFormatterParams<Application, number>) =>
          formatCurrency(value ?? 0),
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 150,
        cellRenderer: ({
          value,
        }: ICellRendererParams<Application, ApplicationStatus>) =>
          value ? <StatusBadge value={value} /> : null,
      },
      {
        field: "appliedDate",
        headerName: "Applied",
        minWidth: 135,
        valueFormatter: ({
          value,
        }: ValueFormatterParams<Application, string | null>) => value ?? "-",
      },
      {
        field: "followUpDate",
        headerName: "Follow-up",
        minWidth: 135,
        valueFormatter: ({
          value,
        }: ValueFormatterParams<Application, string | null>) => value ?? "-",
      },
      {
        field: "contact",
        headerName: "Contact",
        minWidth: 150,
        valueFormatter: ({
          value,
        }: ValueFormatterParams<Application, string | null>) => value ?? "-",
      },
      {
        field: "source",
        headerName: "Source",
        minWidth: 155,
      },
      {
        field: "jobUrl",
        headerName: "Job URL",
        minWidth: 190,
        cellRenderer: ({ value }: ICellRendererParams<Application, string>) =>
          value ? (
            <a
              className="job-link"
              href={value}
              target="_blank"
              rel="noreferrer"
            >
              Open posting
            </a>
          ) : (
            "-"
          ),
      },
      {
        field: "priority",
        headerName: "Priority",
        minWidth: 120,
      },
      {
        colId: "actions",
        headerName: "Actions",
        minWidth: 120,
        maxWidth: 130,
        pinned: "right",
        filter: false,
        sortable: false,
        resizable: false,
        cellRenderer: ({ data }: ICellRendererParams<Application>) =>
          data ? (
            <div className="action-cell">
              <button
                aria-label={`Edit ${data.role}`}
                className="icon-button"
                type="button"
                onClick={() => onEdit(data)}
              >
                <Edit3 size={16} />
              </button>
              <button
                aria-label={`Delete ${data.role}`}
                className="icon-button danger"
                type="button"
                onClick={() => onDelete(data)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : null,
      },
    ],
    [onDelete, onEdit]
  );

  const defaultColDef = useMemo<ColDef<Application>>(
    () => ({
      filter: true,
      floatingFilter: true,
      resizable: true,
      sortable: true,
    }),
    []
  );

  if (error) {
    return <div className="empty-state">{error}</div>;
  }

  return (
    <AgGridReact<Application>
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      domLayout="normal"
      getRowId={({ data }) => data.id}
      loading={isLoading}
      pagination
      paginationPageSize={12}
      paginationPageSizeSelector={[12, 20, 50, 100]}
      quickFilterText={quickFilter}
      rowData={applications}
      rowHeight={48}
      theme={gridTheme}
    />
  );
}
