'use client';

import { useTranslation } from 'react-i18next';
import { Info, Lock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUploadForm } from '@/components/upload-form';

export function FilePreview() {
  const { t } = useTranslation();
  const { previewData, file, protectedColumns, isFillableCell, totalRowCount } = useUploadForm();

  if (!previewData) return null;

  // Helper function to check if a column has any empty cells
  const hasEmptyCells = (header: string): boolean => {
    return previewData.rows.some(row => isFillableCell(header, row[header]));
  };

  return (
    <div className="space-y-2 animate-slide-up">
      <div className="overflow-hidden rounded-md border shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="sticky top-0 z-20 bg-muted/80 backdrop-blur-sm p-2 border-b flex items-center justify-between w-full">
          <h3 className="text-sm font-medium">{t('uploadForm.csvPreview')}</h3>
          <div className="text-xs text-muted-foreground">
            {t('uploadForm.showingRows', { 
              rows: previewData.rows.length, 
              totalRows: file ? (totalRowCount <= 15 ? totalRowCount.toString() : t('uploadForm.many')) : "0" 
            })}
          </div>
        </div>
        <div className="overflow-auto max-h-60">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/30 sticky top-0 z-10">
              <tr>
                {previewData.headers.slice(0, 10).map((header, index) => (
                  <th 
                    key={index} 
                    className={`p-2 text-left font-medium text-xs border-b ${
                      protectedColumns.includes(header) 
                        ? 'text-muted-foreground/80 bg-gray-50/60 backdrop-blur-[1px]' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[150px]">{header}</span>
                      {protectedColumns.includes(header) ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <Lock className="size-3 text-gray-400 flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">{t('uploadForm.protectedField')}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : hasEmptyCells(header) && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="size-3 text-wine-600 flex-shrink-0 animate-pulse-subtle" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">{t('uploadForm.aifillsEmptyCells')}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </th>
                ))}
                {previewData.headers.length > 10 && (
                  <th className="p-2 text-left font-medium text-xs border-b">
                    ...
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {previewData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-0 hover:bg-muted/10 transition-colors duration-150">
                  {previewData.headers.slice(0, 10).map((header, colIndex) => (
                    <td 
                      key={`${rowIndex}-${colIndex}`} 
                      className={`p-2 truncate max-w-[200px] transition-colors duration-200 ${
                        isFillableCell(header, row[header]) 
                          ? 'bg-wine-50 text-wine-800 italic'
                          : protectedColumns.includes(header)
                            ? 'bg-gray-50/60 text-gray-500 backdrop-blur-[1px]'
                            : ''
                      }`}
                    >
                      {row[header] || (isFillableCell(header, row[header]) ? 
                        <span className="flex items-center gap-1 text-wine-600">
                          <span className="size-1.5 bg-wine-400 rounded-full animate-pulse"></span>
                          <span>{t('uploadForm.aifills')}</span>
                        </span> : "-")}
                    </td>
                  ))}
                  {previewData.headers.length > 10 && (
                    <td className="p-2">...</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-col space-y-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-wine-50 rounded-sm border border-wine-200"></div>
          <span>{t('uploadForm.cellsHighlightedPink')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="size-3 text-gray-400" />
          <span>{t('uploadForm.protectedFieldsExplanation')}</span>
        </div>
      </div>
    </div>
  );
} 