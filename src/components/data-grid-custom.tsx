import { useState, useCallback } from 'react'

import {
  DataGrid,
  GridColDef as MuiGridColDef,
  GridToolbar,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid'

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? K | `${K}.${NestedKeyOf<T[K]>}` : K
    }[keyof T & string]
  : never

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

type DeepKeys<T> = Expand<NestedKeyOf<T>>

export type GridColDef<T> = Partial<Omit<MuiGridColDef, 'field' | 'renderCell' | 'hiddenCell'>> & {
  headerName?: string | React.ReactNode
  field?: DeepKeys<T>
  renderCell?: (params: { row: T }) => React.ReactNode
}

type Props<T> = {
  data: Array<T> | undefined
  columns: Array<GridColDef<T>>
}

export const DataGridCustom = <T,>({ data, columns }: Props<T>) => {
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false,
  })

  const handleChangeColumnVisibilityModel = useCallback((newModel: GridColumnVisibilityModel) => {
    setColumnVisibilityModel(newModel)
  }, [])

  const hiddenFields = ['id', '_id']

  const getTogglableColumns = () =>
    columns
      .filter((column) => !hiddenFields.includes(column.field as MuiGridColDef['field']))
      .map((column) => column.field)

  return (
    <DataGrid
      disableRowSelectionOnClick
      rows={data || []}
      columns={columns as MuiGridColDef[]}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={handleChangeColumnVisibilityModel}
      slots={{
        toolbar: GridToolbar,
      }}
      slotProps={{
        columnsPanel: {
          /* @ts-ignore */
          getTogglableColumns,
        },
      }}
    />
  )
}
