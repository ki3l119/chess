import React from "react";

import "./table.scss";
import { Select } from "../select/select";

export type TableProps = {
  headers: string[];
  rows: {
    /**
     * Used by react to identify which rows has changed in the table.
     */
    key: string;
    columns: {
      /**
       * Used by react to identify which columns has changed in the row.
       */
      key: string;
      element: React.ReactNode;
    }[];
  }[];
  minWidth?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange?: (newPage: number) => void;
  };
};

export const Table: React.FC<TableProps> = ({
  headers,
  rows,
  minWidth,
  pagination,
}) => {
  const tableCustomStyles: React.CSSProperties = {};
  if (minWidth !== undefined) {
    tableCustomStyles.minWidth = minWidth;
  }
  const onPaginationSelectChange = (newValue: string) => {
    if (pagination?.onPageChange) {
      pagination.onPageChange(Number(newValue));
    }
  };
  return (
    <div className="table">
      <div className="table__wrapper">
        <table style={tableCustomStyles}>
          <thead>
            <tr className="table__row">
              {headers.map((header) => (
                <th className="table__header" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="table__row" key={row.key}>
                {row.columns.map((col) => (
                  <td className="table__data" key={col.key}>
                    {col.element}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="table__pagination">
          <p>Page</p>
          <Select
            value={pagination.currentPage}
            selectOptions={[
              ...Array.from({ length: pagination.totalPages }, (_, index) =>
                String(index + 1),
              ),
            ].map((choice) => ({
              value: choice,
              display: choice,
            }))}
            onChange={(event) => {
              if (pagination.onPageChange) {
                pagination.onPageChange(Number(event.target.value));
              }
            }}
          />
          <p>of {pagination.totalPages}</p>
        </div>
      )}
    </div>
  );
};
