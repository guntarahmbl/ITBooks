"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface FormData {
  title: string;
  emailPenjual: string;
  price: number;
  condition: string;
  author: string;
  edition: string;
  isbn: string;
  volume: string;
  description: string;
  notes: string;
  contact: string;
  file: File | null;
  norek: string;
  bank: string;
}

export default function AddProductForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    emailPenjual: session?.user?.email || "",
    price: 0,
    condition: "",
    author: "",
    edition: "",
    isbn: "",
    volume: "",
    description: "",
    notes: "",
    contact:"",
    file: null,
    norek: "",
    bank: "",
  });
  const banks = [
    "Bank Mandiri",
    "Bank Rakyat Indonesia (BRI)",
    "Bank Central Asia (BCA)",
    "Bank Negara Indonesia (BNI)",
    "Bank BTN",
    "Bank CIMB Niaga",
    "Bank Danamon",
    "Bank Syariah Indonesia",
    "Bank Permata",
    "Bank Panin",
    "Bank Jago"
  ];
  
  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex flex-col justify-center items-center">
      <div className="w-12 h-12 border-t-4 border-darkRed border-solid rounded-full animate-spin mb-2"/>
      <p className="mt-2 text-black">Mohon menunggu, data anda sedang kami simpan...</p>
    </div>
  );


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };
  
  if (!session) {
    router.push('/');
    return null;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Hanya file gambar yang diizinkan.');
        e.target.value = '';
      } else {
        setFormData(prevData => ({
          ...prevData,
          file: file,
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields: (keyof FormData)[] = [
      "title", 
      "price", 
      "condition", 
      "author", 
      "edition", 
      "isbn", 
      "volume", 
      "description", 
      "file",
      "contact"
    ];
  
    requiredFields.forEach(field => {
      if (!formData[field]) {
        switch (field) {
          case "title":
            newErrors[field] = "Judul buku harus diisi.";
            break;
          case "price":
            newErrors[field] = "Harga buku harus diisi dan lebih dari sama dengan 0.";
            break;
          case "condition":
            newErrors[field] = "Kondisi buku harus diisi.";
            break;
          case "author":
            newErrors[field] = "Nama penulis buku harus diisi.";
            break;
          case "edition":
            newErrors[field] = "Edisi buku harus diisi.";
            break;
          case "isbn":
            newErrors[field] = "ISBN buku harus diisi.";
            break;
          case "volume":
            newErrors[field] = "Jilid buku harus diisi.";
            break;
          case "description":
            newErrors[field] = "Deskripsi buku harus diisi.";
            break;
          case "contact":
            newErrors[field] = "Kontak harus diisi.";
            break;
          case "file":
            newErrors[field] = "Gambar buku harus diunggah.";
            break;
          default:
            newErrors[field] = `${field} harus diisi.`;
        setIsSubmitting(false);
        }
      }
    });
  
    if (formData.price < 0) {
      newErrors.price = "Harga harus lebih besar dari 0.";
      setIsSubmitting(false);
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setIsSubmitting(true)
    setLoading(true);

    const data = new FormData();
    if (formData.file) {
      data.append("file", formData.file);
    }
    data.append("upload_preset", "ml_default");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dwxvrynly/image/upload`, {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error("Failed to upload image");
      const result = await res.json();
      const imageUrl = result.secure_url;
      
      const formDataWithEmail = {
        ...formData,
        emailPenjual: session?.user?.email || "",
        imageUrl,
      };

      const saveRes = await fetch("/api/add-catalogue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataWithEmail),
      });

      if (!saveRes.ok) throw new Error("Gagal menambahkan produk!");

      setFormData({
        title: "",
        emailPenjual: session?.user?.email as string,
        price: 0,
        condition: "",
        author: "",
        edition: "",
        isbn: "",
        volume: "",
        description: "",
        notes: "",
        contact:"",
        file: null,
        norek:"",
        bank:"",
      });
      setIsSubmitting(false)
      setErrors({});
      router.push('/seller/myproducts');
      router.refresh();

    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menambahkan produk!");
      setIsSubmitting(false)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full items-center">
      {loading && <LoadingSpinner />}

      <div id="header" className="flex flex-row items-center justify-between h-20 w-[90%]">
        <h1 className="font-bold text-[2.5rem] text-white">Tambahkan Produk</h1>
        <Link href="/seller/myproducts" className="w-50 h-50 hover:scale-105">
          <Image src="/home_beige.svg" width={50} height={50} alt="Home" />
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-y-5 items-center w-[90%] rounded-3xl min-h-screen bg-white text-deepBurgundy p-10 mx-auto ${loading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <h1 className="font-bold text-xl">Spesifikasi Produk</h1>
        <p className="text-lg -mt-3">Masukkan detail produk yang ingin anda unggah di sini.</p>
        <p className="text-lg -mt-5">Isi sesuai dengan data yang sebenar-benarnya.</p>

        <div className="flex flex-row w-full justify-between">
          <div className="w-[40%]">
            <p>Judul Buku*</p>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`border rounded-xl w-full px-5 py-2 ${errors.title ? 'border-red-500' : 'border-black'}`}
              placeholder="Masukkan judul buku yang ingin anda jual"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>
          <div className="w-[40%]">
            <p>Harga Buku*</p>
            <p className="text-sm">Tidak perlu menggunakan simbol atau tanda</p>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`border rounded-xl w-full px-5 py-2 ${errors.price ? 'border-red-500' : 'border-black'}`}
              placeholder="Masukkan harga buku dalam rupiah"
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
          </div>
        </div>

        <div className="w-full">
          <p>Kondisi Buku*</p>
          <input
            type="text"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`border rounded-xl w-full px-5 py-2 ${errors.condition ? 'border-red-500' : 'border-black'}`}
            placeholder="Jelaskan kondisi buku yang ingin anda jual"
          />
          {errors.condition && <p className="text-red-500 text-sm">{errors.condition}</p>}
        </div>

        <div className="grid grid-cols-2 gap-x-[20%] gap-y-5 w-full">
          <div className="w-full">
            <p>Penulis Buku*</p>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`border rounded-xl w-full px-5 py-2 ${errors.author ? 'border-red-500' : 'border-black'}`}
              placeholder="Masukkan nama penulis buku"
            />
            {errors.author && <p className="text-red-500 text-sm">{errors.author}</p>}
          </div>

          <div className="w-full">
            <p>Edisi Buku*</p>
            <input
              type="text"
              name="edition"
              value={formData.edition}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`border rounded-xl w-full px-5 py-2 ${errors.edition ? 'border-red-500' : 'border-black'}`}
              placeholder="Masukkan Edisi buku yang ingin anda jual"
            />
            {errors.edition && <p className="text-red-500 text-sm">{errors.edition}</p>}
          </div>

          <div className="w-full">
            <p>ISBN Buku*</p>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`border rounded-xl w-full px-5 py-2 ${errors.isbn ? 'border-red-500' : 'border-black'}`}
              placeholder="Masukkan ISBN buku yang ingin anda jual"
            />
            {errors.isbn && <p className="text-red-500 text-sm">{errors.isbn}</p>}
          </div>

          <div className="w-full">
            <p>Jilid Buku*</p>
            <input
              type="text"
              name="volume"
              value={formData.volume}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`border rounded-xl w-full px-5 py-2 ${errors.volume ? 'border-red-500' : 'border-black'}`}
              placeholder="Masukkan Jilid buku yang ingin anda jual"
            />
            {errors.volume && <p className="text-red-500 text-sm">{errors.volume}</p>}
          </div>
        </div>

        <div className="w-full">
          <p>Deskripsi Buku*</p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`border rounded-xl w-full px-5 py-2 ${errors.description ? 'border-red-500' : 'border-black'}`}
            placeholder="Jelaskan informasi buku yang ingin anda jual"
            rows={4}
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        <div className="w-full">
          <p>Catatan Tambahan</p>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className={`border rounded-xl w-full px-5 py-2 ${errors.notes ? 'border-red-500' : 'border-black'}`}
            placeholder="Jelaskan informasi tambahan buku yang ingin anda jual"
            rows={4}
          />
        </div>

        <div className="w-full">
          <p>Kontak*</p>
          <textarea
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className={`border rounded-xl w-full px-5 py-2 ${errors.contact ? 'border-red-500' : 'border-black'}`}
            placeholder="Instagram: @exampleacc or Line: @exampleid"
            rows={1}
          />
        </div>

        <div className="w-full">
          <p>Nomor Rekening</p>
          <textarea
            name="norek"
            value={formData.norek}
            onChange={handleChange}
            className={`border rounded-xl w-full px-5 py-2 ${errors.norek ? 'border-red-500' : 'border-black'}`}
            placeholder="Masukkan nomor rekening anda"
            rows={1}
          />
        </div>
        
        <div className="w-full my-5">
          <h1>Jenis Bank</h1>
          <select 
            name="bank" 
            id="" 
            className={`border rounded-xl w-full px-5 py-2 ${errors.bank ? 'border-red-500' : 'border-black'}`}
            onChange={handleChange}
            value={formData.bank || ""}
          >
            {banks.map((bank) => (
                <option key={bank} value={`${bank}`}>{`${bank}`}</option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <h1>Unggah produk</h1>
          <input 
            type="file" 
            name="file" 
            onChange={handleFileChange}
            className={`w-full ${errors.file ? 'border-red-500' : ''}`}
          />
          {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
        </div>

        <button 
          type="submit" 
          className="mt-5 px-4 py-2 bg-deepBurgundy hover:scale-105 duration-200 text-white rounded-xl"
          disabled={isSubmitting}
          >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}