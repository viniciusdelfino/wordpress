import Footer from "./_components/layout/Footer/Footer";
import Header from "./_components/layout/Header/Header";
import VehiclePlateCheck from "./_components/features/VehiclePlateCheck/VehiclePlateCheck";
import VehicleSearchForm from "./_components/features/VehicleSearchForm/VehicleSearchForm";
import { wordpressAPI } from "./lib/wordpress-api";
import BlockRenderer from "./_components/BlockRenderer";

export default async function Home() {
  const page = await wordpressAPI.getPage("pagina-inicial");

  const handlePlateVerified = (plate: string) => {
    console.log("Placa verificada:", plate);
  };

  return (
    <>
      <BlockRenderer blocks={page?.blocks} />
      {/* <VehiclePlateCheck 
          onPlateVerified={handlePlateVerified}
        />
        <VehicleSearchForm /> */}
    </>
  );
}
