"use client";

import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";

import type { MarketListing } from "./MarketView";

function markerIcon(selected: boolean) {
  return L.divIcon({
    className: `garden-marker${
      selected ? " selected" : ""
    }`,
    html: "<span></span>",
    iconSize: selected
      ? [20, 20]
      : [14, 14],
    iconAnchor: selected
      ? [10, 10]
      : [7, 7],
  });
}

function FitToListings({
  listings,
}: {
  listings: MarketListing[];
}) {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(
      listings.map((l) => [
        l.lat,
        l.lng,
      ])
    );

    map.fitBounds(
      bounds.pad(0.15),
      {
        maxZoom: 13,
      }
    );
  }, [map, listings]);

  return null;
}

export default function MarketMap({
  listings,
  selectedId,
  onSelect,
}: {
  listings: MarketListing[];
  selectedId: string | null;
  onSelect: (
    id: string | null
  ) => void;
}) {
  return (
    <MapContainer
      center={[-33.8635, 151.05]}
      zoom={11}
      className="h-full w-full"
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <FitToListings
        listings={listings}
      />

      {listings.map((l) => (
        <Marker
          key={l.id}
          position={[
            l.lat,
            l.lng,
          ]}
          icon={markerIcon(
            l.id === selectedId
          )}
          title={`${l.title}, ${l.address}`}
          eventHandlers={{
            click: () => {
              onSelect(
                l.id === selectedId
                  ? null
                  : l.id
              );

              document
                .getElementById(
                  `listing-${l.id}`
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                  block: "center",
                });
            },
          }}
        >
          <Tooltip
            direction="top"
            offset={[0, -8]}
          >
            <span className="text-[13px]">
              {l.title}
              {l.price != null
                ? ` · $${l.price}`
                : ""}
            </span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}