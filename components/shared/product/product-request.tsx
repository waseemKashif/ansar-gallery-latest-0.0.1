'use client'
import { Button } from "@/components/ui/button";
 import { useState } from "react";
 import { Check } from "lucide-react";
 const ProductRequest = ({className}:{className?:string}) => {
     const [requested, setRequested] = useState(false);
    return (
      <Button variant="ghost" onClick={() => setRequested(!requested)} className={className} >
     
        {requested ? (
          <p className=" flex flex-nowrap gap-1">
            <Check /> Requested
          </p>
        ) : (
          "Make Request"
        )}
      </Button>
    );
 }
  
 export default ProductRequest;