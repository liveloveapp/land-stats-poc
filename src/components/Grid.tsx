import { ColDef, IServerSideDatasource } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { FC, memo, ReactElement, useCallback, useMemo, useState } from 'react';

import 'ag-grid-enterprise/styles/ag-grid.css';
import 'ag-grid-enterprise/styles/ag-theme-alpine.css';
import { fetchChunk } from '../utils/fetch-chunk.ts';

interface RowData {
  state: string;
  name: string;
  zipcode: string;
  street: string;
  price: number;
  status: string;
}

export const Grid: FC = memo(function Grid(): ReactElement {
  const [columnDefs] = useState<ColDef<RowData>[]>([
    {
      headerName: 'State',
      field: 'state',
      colId: 'state.id',
      rowGroup: true,
      valueGetter: (params) => params.data.id,
    },
    {
      headerName: 'County',
      field: 'name',
      colId: 'county.name',
      rowGroup: true,
    },
    {
      headerName: 'Zip Code',
      field: 'zipcode',
      colId: 'county_zipcode.zipcode',
      rowGroup: true,
    },
    {
      field: 'street',
    },
    {
      field: 'price',
      valueFormatter: (params) => {
        if (!params.value) {
          return null;
        }
        return params.value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        });
      },
    },
    {
      field: 'status',
    },
  ]);

  const datasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (params) => {
        fetchChunk(params.request)
          .then((data) => {
            params.success({
              rowData: data,
            });
          })
          .catch((error) => {
            console.error(error);
            params.fail();
          });
      },
    };
  }, []);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 100,
      sortable: false,
    };
  }, []);

  const onGridReady = useCallback(() => {
    console.log('Grid is ready');
  }, []);

  return (
    <div className="ag-theme-alpine land-stats-grid">
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowModelType={'serverSide'}
        cacheBlockSize={100}
        onGridReady={onGridReady}
        serverSideDatasource={datasource}
      />
    </div>
  );
});

Grid.displayName = 'Grid';
