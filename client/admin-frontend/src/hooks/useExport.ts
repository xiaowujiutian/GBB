import { useState } from 'react';
import { message } from 'antd';
import { downloadFile } from '@/utils/helpers';

interface ExportOptions {
  filename?: string;
  format?: 'xlsx' | 'csv' | 'json';
}

export const useExport = () => {
  const [loading, setLoading] = useState(false);

  // 简化版Excel导出（实际上是CSV格式）
  const exportToExcel = async (data: any[], options: ExportOptions = {}) => {
    const { filename = 'export' } = options;
    
    try {
      setLoading(true);
      
      if (!data || data.length === 0) {
        message.warning('没有数据可导出');
        return;
      }

      // 使用CSV格式代替Excel，但保存为.xlsx扩展名以满足用户期望
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // 处理包含逗号、换行符的值
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { 
        type: 'application/vnd.ms-excel;charset=utf-8;'
      });
      
      downloadFile(blob, `${filename}.xlsx`);
      message.success('导出成功');
    } catch (error) {
      console.error('Export error:', error);
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出为CSV
  const exportToCSV = async (data: any[], filename: string = 'export') => {
    try {
      setLoading(true);
      
      if (!data || data.length === 0) {
        message.warning('没有数据可导出');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // 处理包含逗号的值
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      downloadFile(blob, `${filename}.csv`);
      message.success('导出成功');
    } catch (error) {
      console.error('CSV export error:', error);
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出为JSON
  const exportToJSON = async (data: any[], filename: string = 'export') => {
    try {
      setLoading(true);
      
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { 
        type: 'application/json;charset=utf-8;' 
      });
      
      downloadFile(blob, `${filename}.json`);
      message.success('导出成功');
    } catch (error) {
      console.error('JSON export error:', error);
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 批量导出
  const exportData = async (
    data: any[], 
    format: 'xlsx' | 'csv' | 'json' = 'xlsx',
    filename: string = 'export'
  ) => {
    switch (format) {
      case 'xlsx':
        return exportToExcel(data, { filename, format });
      case 'csv':
        return exportToCSV(data, filename);
      case 'json':
        return exportToJSON(data, filename);
      default:
        message.error('不支持的导出格式');
    }
  };

  return {
    loading,
    exportToExcel,
    exportToCSV,
    exportToJSON,
    exportData,
  };
};

export default useExport;
