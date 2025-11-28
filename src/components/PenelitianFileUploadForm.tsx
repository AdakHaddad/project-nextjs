import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';

interface PenelitianFileUploadFormProps {
  closeModal: () => void;
}

export function PenelitianFileUploadForm({ closeModal }: PenelitianFileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      alert('Please upload a .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headerIndex = lines.findIndex(line => line.startsWith('NO;DATA ID'));
      if (headerIndex === -1) {
        alert('Could not find header row in file');
        return;
      }
      const cleanedCsv = lines.slice(headerIndex).join('\n');

      Papa.parse(cleanedCsv, {
        delimiter: ';',
        header: true,
        skipEmptyLines: true,
        complete: async function(results) {
          const transformedData = results.data.map((row: any) => {
            const nidnMatch = /NIDN: (\d+)/.exec(row.PENULIS);
            const penulisNidn = nidnMatch ? nidnMatch[1] : null;

            let departmentId = null;
            if (row.UNIT === 'Fakultas Kedokteran, Kesehatan Masyarakat, dan Keperawatan') {
              departmentId = 13;
            }

            return {
              id_data: row['DATA ID'],
              judul: row.JUDUL,
              penulisNidn: penulisNidn,
              tingkat: row.TINGKAT,
              url: row['URL BERKAS'],
              id_department: departmentId,
              tahun: row.TAHUN,
            };
          });

          console.log("Parsed Results:", transformedData);

          try {
            const response = await fetch('/api/upload-penelitian', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(transformedData),
            });

            if (response.ok) {
              const responseData = await response.json();
              const summary = responseData.results.summary || 
                `Successful: ${responseData.results.success}\nSkipped (no NIDN): ${responseData.results.skippedNoNIDN || 0}\nSkipped (no department): ${responseData.results.skippedNoDepartment || 0}\nSkipped (invalid format): ${responseData.results.skippedInvalidFormat || 0}\nErrors: ${responseData.results.errors.length}`;
              alert(`File processed successfully!\n\n${summary}`);
              closeModal();
            } else {
              const errorData = await response.json();
              alert(`Error processing file: ${errorData.message}`);
            }
          } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
          }
        },
        error: function(error: any) {
          console.error('Error parsing file:', error);
          alert('Error parsing file');
        },
      });
    };
    reader.readAsText(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Input type="file" accept=".csv" onChange={handleFileChange} />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={closeModal}>
          Batal
        </Button>
        <Button type="submit" className="bg-green-500 text-white">
          Simpan
        </Button>
      </div>
    </form>
  );
}