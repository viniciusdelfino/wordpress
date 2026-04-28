import FindOilBanner from "@/app/_components/blocks/FindOilBanner";

export default function FindOilBannerFallback() {
  return (
    <FindOilBanner
      bg_image={{
        url: "/images/navio-2-3.jpg",
        alt: "Conheça toda a linha Mobil One",
        width: 1440,
        height: 269,
      }}
      desc="<h2>Conheça toda a linha Mobil One</h2><p>A linha mais avançada de lubrificantes sintéticos para o máximo desempenho do seu motor.</p>"
      button={{
        title: "Ver linha completa",
        url: "/produtos",
        target: "_self",
      }}
      banner_high={false}
      banner_width={true}
    />
  );
}
