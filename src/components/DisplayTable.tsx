'use client'

import React, { useState, useEffect } from 'react'
import * as TableComponents from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import Link from 'next/link';

type Department = {
  id_department: number;
  nama: string;
  dosen: {
    id: number;
    nidn: string | null;
    nama: string;
    role: string | null;
    scopusId: string | null;
    orcidId: string | null;
    googleScholarId: string | null;
    id_department: number;
  }[];
  _count: {
    dosen: number;
    pengabdian: number;
    penelitian: number;
  };
};
interface DepartmentTableProps {
  departments: Department[];
}
interface DashboardProps {
  selectedYear: string;
}

export function TableDepartment({ departments, selectedYear }: DepartmentTableProps & DashboardProps ) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentData, setDepartmentData] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredData = departments.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const url = selectedYear === "all" 
          ? `/api/stats`
          : `/api/stats?year=${selectedYear}`;
          
        const response = await fetch(url);
        const data: Department = await response.json();
        setDepartmentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [selectedYear]);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Departemen</h2>
        <div className="flex items-center">
          <span className="mr-2 font-bold">Search:</span>
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <TableComponents.Table>
            <TableComponents.TableHeader className="bg-gray-100 sticky top-0">
              <TableComponents.TableRow>
                <TableComponents.TableHead className="w-16 text-left">No</TableComponents.TableHead>
                <TableComponents.TableHead className="w-1/2 text-left">Nama Departemen</TableComponents.TableHead>
                <TableComponents.TableHead className="w-24 text-center">Dosen</TableComponents.TableHead>
                <TableComponents.TableHead className="w-24 text-center">Penelitian</TableComponents.TableHead>
                <TableComponents.TableHead className="w-24 text-center">Pengabdian</TableComponents.TableHead>
                <TableComponents.TableHead className="w-24 text-center">Action</TableComponents.TableHead>
              </TableComponents.TableRow>
            </TableComponents.TableHeader>
            <TableComponents.TableBody>
              {filteredData.map((department, index) => (
                <TableComponents.TableRow key={department.id_department}>
                  <TableComponents.TableCell>{index + 1}</TableComponents.TableCell>
                  <TableComponents.TableCell>{department.nama}</TableComponents.TableCell>
                  <TableComponents.TableCell className="text-center">{department._count.dosen}</TableComponents.TableCell>
                  <TableComponents.TableCell className="text-center">{department._count.penelitian}</TableComponents.TableCell>
                  <TableComponents.TableCell className="text-center">{department._count.pengabdian}</TableComponents.TableCell>
                  <TableComponents.TableCell className="text-center">
                    <Link href={`dashboard/department/${department.nama}`}>
                      <Button variant="outline" size="sm">Detail</Button>
                    </Link> 
                  </TableComponents.TableCell>
                </TableComponents.TableRow>
              ))}
            </TableComponents.TableBody>
          </TableComponents.Table>
        </div>
      </div>
    </div>
  );
}

