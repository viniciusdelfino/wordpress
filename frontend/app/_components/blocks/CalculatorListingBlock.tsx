import Image from "next/image";
import Link from "next/link";

interface Calculator {
  image?: { url: string; alt: string };
  title: string;
  description?: string;
  link?: { title: string; url: string; target: string };
  icon?: { url: string; alt: string };
}

interface CalculatorListingBlockProps {
  section_id?: string;
  title?: string;
  description?: string;
  calculators?: Calculator[];
}

// Arrow icon component matching Figma design (16x16)
function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.333 8h9.334M8.667 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Gears icon for "Engrenagens" calculator
function GearsIcon() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Air compressor icon for "Compressores de Ar" calculator
function CompressorIcon() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="6"
        width="14"
        height="12"
        rx="2"
        stroke="white"
        strokeWidth="1.5"
      />
      <path
        d="M17 10H21V14H17"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="12" r="2" stroke="white" strokeWidth="1.5" />
      <path
        d="M11 9V15"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13 10V14"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Bearing icon for "Rolamentos" calculator
function BearingIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" />
      <circle cx="12" cy="4" r="1.5" fill="white" />
      <circle cx="12" cy="20" r="1.5" fill="white" />
      <circle cx="4" cy="12" r="1.5" fill="white" />
      <circle cx="20" cy="12" r="1.5" fill="white" />
      <circle cx="6.34" cy="6.34" r="1.5" fill="white" />
      <circle cx="17.66" cy="17.66" r="1.5" fill="white" />
      <circle cx="6.34" cy="17.66" r="1.5" fill="white" />
      <circle cx="17.66" cy="6.34" r="1.5" fill="white" />
    </svg>
  );
}

// Motor icon for "Motor Elétrico" calculator
function MotorIcon() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Hydraulic icon for "Sistemas Hidráulicos" calculator
function HydraulicIcon() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2.69L17.66 8.35C18.7789 9.46899 19.5641 10.8758 19.9309 12.4145C20.2976 13.9532 20.2318 15.5612 19.7406 17.0641C19.2494 18.567 18.3517 19.9037 17.1459 20.9274C15.94 21.9511 14.4745 22.6211 12.91 22.86C12.3075 22.9533 11.6925 22.9533 11.09 22.86C9.52553 22.6211 8.05996 21.9511 6.85414 20.9274C5.64833 19.9037 4.75062 18.567 4.25942 17.0641C3.76822 15.5612 3.70236 13.9532 4.06914 12.4145C4.43592 10.8758 5.22106 9.46899 6.34 8.35L12 2.69Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Gas motor icon for "Motor a Gás" calculator
function GasMotorIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8V12"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1" fill="white" />
    </svg>
  );
}

// Get the appropriate icon based on calculator title
function getCalculatorIcon(title: string) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("engrenagem") || lowerTitle.includes("gear")) {
    return <GearsIcon />;
  }
  if (lowerTitle.includes("compressor") || lowerTitle.includes("ar")) {
    return <CompressorIcon />;
  }
  if (lowerTitle.includes("rolamento") || lowerTitle.includes("bearing")) {
    return <BearingIcon />;
  }
  if (
    lowerTitle.includes("motor elétrico") ||
    lowerTitle.includes("electric")
  ) {
    return <MotorIcon />;
  }
  if (lowerTitle.includes("hidráulico") || lowerTitle.includes("hydraulic")) {
    return <HydraulicIcon />;
  }
  if (lowerTitle.includes("gás") || lowerTitle.includes("gas")) {
    return <GasMotorIcon />;
  }

  // Default fallback icon (settings/gear)
  return <GearsIcon />;
}

export default function CalculatorListingBlock({
  section_id,
  title,
  description,
  calculators,
}: CalculatorListingBlockProps) {
  return (
    <section
      id={section_id || "calculadoras-lista"}
      className="py-10 md:py-14 lg:py-[60px] bg-white"
    >
      <div className="container">
        {/* Section Header */}
        {(title || description) && (
          <div className="mb-6 md:mb-8 lg:mb-[40px] max-w-2xl">
            {title && (
              <h2 className="text-dark-blue text-2xl md:text-3xl lg:text-[32px] lg:leading-[40px] font-semibold mb-2">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-low-dark-blue text-sm md:text-base lg:text-[18px] leading-normal lg:w-[456px]">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Calculator Cards Grid */}
        {calculators && calculators.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-4">
            {calculators.map((calc, index) => (
              <div
                key={index}
                className="group relative bg-white border border-[#001450] rounded-[8px] overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                {/* Card Image with gradient overlay */}
                {calc.image && (
                  <div className="relative">
                    <div className="relative h-[200px] md:h-[212px] lg:h-[220px] overflow-hidden">
                      <Image
                        src={calc.image.url}
                        alt={calc.image.alt || calc.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={88}
                        className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage:
                            "linear-gradient(180deg, rgba(0, 20, 80, 0) 0%, rgba(0, 20, 80, 0.48) 100%)",
                        }}
                      />
                    </div>
                    {/* Icon Badge - floating below image boundary */}
                    <div className="absolute left-5 -bottom-[30px] w-[60px] h-[60px] bg-[#001450] rounded-[16px] flex items-center justify-center z-10 shadow-[0px_2px_6px_rgba(0,0,0,0.3)]">
                      {calc.icon ? (
                        <Image
                          src={calc.icon.url}
                          alt={calc.icon.alt || ""}
                          width={50}
                          height={50}
                          className="brightness-0 invert"
                        />
                      ) : (
                        getCalculatorIcon(calc.title)
                      )}
                    </div>
                  </div>
                )}

                <div className="px-5 md:px-6 pt-12 pb-7 md:pb-8 flex flex-col gap-5 md:gap-6 flex-1 antialiased">
                  <div className="flex flex-col gap-3 md:gap-4">
                    <h3 className="text-dark-blue font-semibold text-xl lg:text-[24px] lg:leading-[27.5px]">
                      {calc.title}
                    </h3>

                    {calc.description && (
                      <p className="text-low-dark-blue text-base leading-normal [text-rendering:optimizeLegibility]">
                        {calc.description}
                      </p>
                    )}
                  </div>

                  {calc.link && (
                    <Link
                      href={calc.link.url}
                      target={calc.link.target || "_self"}
                      className="flex items-center justify-between mt-auto text-red font-semibold text-base leading-[16px] hover:underline transition-colors"
                    >
                      <span>{calc.link.title}</span>
                      <ArrowRightIcon />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
