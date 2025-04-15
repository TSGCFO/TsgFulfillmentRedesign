import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsLeft, 
  ChevronsRight, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  sortable?: boolean;
  cell?: (data: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchable?: boolean;
  downloadable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (data: T) => void;
  loading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  title,
  searchable = true,
  downloadable = true,
  pagination = true,
  pageSize = 10,
  onRowClick,
  loading = false
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;
  
  // Sort data if sorting is active
  const sortedData = sortBy
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue === bValue) return 0;
        
        const result = aValue < bValue ? -1 : 1;
        return sortDesc ? -result : result;
      })
    : filteredData;
  
  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = pagination
    ? sortedData.slice(startIndex, startIndex + pageSize)
    : sortedData;
  
  // Handle sort toggle
  const handleSort = (accessor: keyof T) => {
    if (sortBy === accessor) {
      if (sortDesc) {
        setSortBy(null);
        setSortDesc(false);
      } else {
        setSortDesc(true);
      }
    } else {
      setSortBy(accessor);
      setSortDesc(false);
    }
  };
  
  // Calculate page navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  // Download as CSV
  const downloadCSV = () => {
    // Convert data to CSV format
    const headers = columns.map(col => typeof col.header === 'string' ? col.header : 'Column');
    
    const rows = sortedData.map(item => 
      columns.map(col => {
        if (typeof col.accessor === 'function') {
          return '';
        }
        return String(item[col.accessor] || '');
      })
    );
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title || 'data'}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card className="shadow-md overflow-hidden">
      {/* Header */}
      {(title || searchable || downloadable) && (
        <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b gap-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            {searchable && (
              <div className="relative">
                <Input 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 w-full md:w-[250px]"
                />
                <Filter className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
              </div>
            )}
            
            {downloadable && (
              <Button variant="outline" size="sm" onClick={downloadCSV}>
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, i) => (
                <th 
                  key={i}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <span>{column.header}</span>
                    {column.sortable && typeof column.accessor === 'string' && (
                      <button 
                        className="ml-1 focus:outline-none" 
                        onClick={() => handleSort(column.accessor as keyof T)}
                      >
                        {sortBy === column.accessor ? (
                          sortDesc ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 text-gray-300">
                            <ChevronUp className="h-2 w-2" />
                            <ChevronDown className="h-2 w-2" />
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr 
                  key={i} 
                  className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.cell 
                        ? column.cell(row)
                        : typeof column.accessor === 'function'
                          ? column.accessor(row)
                          : String(row[column.accessor] || '')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(startIndex + pageSize, sortedData.length)}
                </span>{' '}
                of <span className="font-medium">{sortedData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  // Show pages around current page
                  let pageNum = currentPage;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else {
                    pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages));
                  }
                  
                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
          
          <div className="flex sm:hidden justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}