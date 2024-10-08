"use client"
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function List({ idBuku, name, price, type }: { idBuku: number, name: string, price: number, type: String }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const route = type === "catalogue" ? `/api/catalogue-delete/${idBuku}` : "/api/cart-delete/";
            const response = await fetch(route, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idBuku: idBuku,
                }),
            });

    
            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            router.refresh();
            alert('Item deleted successfully'); 

        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting item');
        } finally {
            setIsLoading(false);
        }
    };
    

    return (
            <div className="flex flex-row items-center border border-black rounded-xl p-2 bg-cream my-3 hover:scale-105 duration-300 transition-all">
                <Link href={type === "catalogue" ? `myproducts/details/${idBuku}`: ""} className="flex flex-row justify-start items-center w-[100%]">
                    <div id="title" className="w-[40%] flex flex-row items-center">
                        <input type="checkbox" name="" id="" className="h-5 w-5" />
                        <Image src="/books2.svg" width={50} height={50} alt="" />
                        <h2>{name}</h2>
                    </div>
                    <p className="flex w-[15%]">1</p>
                    <p className="w-[25%]">{price}</p>
                    <p className="w-[15%]">{price}</p>
                </Link>
                {type === "catalogue" ? (
                    <Link href={`myproducts/editproduct/${idBuku}`} className="mr-10">Edit</Link>
                ) : (
                    <div className="mr-10"></div>
                )}
                <button
                    type="button"
                    className="w-[2%]"
                    onClick={handleDelete}
                    disabled={isLoading}
                > 
                    <Image src="/trash.svg" width={25} height={25} alt="" className="w-full" />
                </button>
            </div>
        
    );
}