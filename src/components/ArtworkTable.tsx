// src/components/ArtworkTable.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  DataTable,
  type DataTableStateEvent,
  type DataTableSelectionMultipleChangeEvent,
  type DataTablePageEvent
} from 'primereact/datatable';

import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';

import type { Artwork } from '../types';
import { fetchArtworks } from '../services/api';

const DEFAULT_ROWS = 10;

export const ArtworkTable: React.FC = () => {
  // --- Component State ---
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Pagination State ---
  const [lazyState, setLazyState] = useState<DataTableStateEvent>({
    first: 0,
    rows: DEFAULT_ROWS,
    sortField: '', // ✅ must be string, not undefined
    sortOrder: undefined,
    filters: {},
    multiSortMeta: undefined,
  });

  // --- Selection State ---
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

  // --- Custom Select Overlay ---
  const [customSelectCount, setCustomSelectCount] = useState<string>('');
  const op = useRef<OverlayPanel>(null);

  // --- Fetch Data ---
  const loadArtworks = async () => {
    setLoading(true);
    try {
      const page = Math.floor(lazyState.first / lazyState.rows) + 1;
      const limit = lazyState.rows;
      const response = await fetchArtworks(page, limit);

      setArtworks(response.data);
      setTotalRecords(response.pagination.total);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever pagination or sorting changes
  useEffect(() => {
    loadArtworks();
  }, [lazyState]);

  // --- Derived State ---
  const selectedArtworksOnCurrentPage = useMemo(() => {
    return artworks.filter((art: Artwork) => selectedRowIds.has(art.id));
  }, [artworks, selectedRowIds]);

  // --- Selection Handler (✅ corrected type) ---
  const onSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
  const newSelectedObjects: Artwork[] = e.value as Artwork[];

    const newSelectedIdsOnPage = new Set(newSelectedObjects.map((art) => art.id));
    const currentPageIds = new Set(artworks.map((art) => art.id));

    setSelectedRowIds((prevMasterIds) => {
      const newMasterSet = new Set(prevMasterIds);

      // Add newly selected IDs
      newSelectedIdsOnPage.forEach((id) => newMasterSet.add(id));

      // Remove deselected IDs
      currentPageIds.forEach((id) => {
        if (!newSelectedIdsOnPage.has(id)) {
          newMasterSet.delete(id);
        }
      });

      return newMasterSet;
    });
  };

  // --- Custom Select Handler ---
  const handleCustomSelect = () => {
    const count = parseInt(customSelectCount, 10);
    if (!count || count <= 0 || count > artworks.length) {
      alert('Please enter a valid number (1 to current page size).');
      return;
    }

    const idsToSelect = artworks.slice(0, count).map((art) => art.id);

    setSelectedRowIds((prevMasterIds) => {
      const newSet = new Set(prevMasterIds);
      idsToSelect.forEach((id) => newSet.add(id));
      return newSet;
    });

    op.current?.hide();
    setCustomSelectCount('');
  };

  // --- Pagination Handler ---
  const onPageChange = (event: DataTablePageEvent) => {
    setLazyState((prevState) => ({
      ...prevState,
      ...event,
    }));
  };

  // --- Render ---
  return (
    <div className="card">
      {/* Header Controls */}
      <div style={{ margin: '1rem 0' }}>
        <Button
          type="button"
          label="Custom Row Select"
          icon="pi pi-plus"
          onClick={(e) => op.current?.toggle(e)}
        />
        <span style={{ marginLeft: '1rem' }}>
          <strong>Total Selected: {selectedRowIds.size}</strong>
        </span>
      </div>

      {/* Custom Select Overlay */}
      <OverlayPanel ref={op} style={{ padding: '1rem' }}>
        <div>
          <label htmlFor="selectCount" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Select Top N Rows (on this page)
          </label>
          <InputText
            id="selectCount"
            value={customSelectCount}
            onChange={(e) => setCustomSelectCount(e.target.value)}
            type="number"
            placeholder="e.g., 5"
          />
          <Button label="Apply" onClick={handleCustomSelect} style={{ marginTop: '0.5rem' }} />
        </div>
      </OverlayPanel>

      {/* DataTable */}
      <DataTable
        value={artworks}
        lazy
        paginator
        first={lazyState.first}
        rows={lazyState.rows}
        rowsPerPageOptions={[10, 25, 50]}
        totalRecords={totalRecords}
        onPage={onPageChange}
        loading={loading}
        selectionMode="multiple"
        selection={selectedArtworksOnCurrentPage}
        onSelectionChange={onSelectionChange}
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="id" header="ID" />
        <Column field="title" header="Title" />
        <Column field="artist_display" header="Artist" />
        <Column field="place_of_origin" header="Origin" />
        <Column
          field="inscriptions"
          header="Inscriptions"
          style={{ maxWidth: '200px', whiteSpace: 'pre-wrap' }}
        />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
};

