import React from "react";

function PromoPrice({
  catalog,
  price,
  badge,
  className = "",
  size = "lg",
}) {
  const hasPromo =
    catalog != null && price != null && Number(price) < Number(catalog);

  if (!hasPromo) {
    return (
      <p className={className}>
        {catalog != null ? `${catalog}€` : ""}
      </p>
    );
  }

  const priceClass =
    size === "lg"
      ? "font-display text-4xl font-semibold text-[#c97886] xl:text-[2.75rem]"
      : "font-semibold text-[#c97886]";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {badge && (
        <span className="mb-1 rounded-full bg-[#c97886] px-2.5 py-0.5 font-body text-[11px] font-semibold tracking-wide text-white">
          {badge}
        </span>
      )}
      <p className={priceClass}>{price}€</p>
      <p className="mt-0.5 font-body text-sm text-[#6e5656]/45 line-through">
        {catalog}€
      </p>
    </div>
  );
}

export default PromoPrice;
