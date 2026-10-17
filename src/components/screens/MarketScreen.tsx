'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Store,
  ShoppingCart,
  MapPin,
  Phone,
  Tag,
  CheckCircle,
  Clock,
  ShieldCheck,
  Plus,
  Truck,
  FileCheck,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AgriProduct, CropBuyerBid, CropSellListing, SoilTestingPackage } from '@/lib/types';

export function MarketScreen() {
  const {
    marketPrices,
    agriProducts,
    cartItems,
    addToCart,
    updateCartQty,
    placeAgriOrder,
    agriShops,
    cropListings,
    buyerBids,
    physicalMandis,
    soilPackages,
    listCropForSale,
    acceptBuyerBid,
    bookSoilTest,
  } = useKisanStore();

  const [activeTab, setActiveTab] = useState<'mandi' | 'buy_online' | 'buy_offline' | 'sell_online' | 'sell_offline' | 'soil_test'>('mandi');

  // Sell Online Form State
  const [showListingForm, setShowListingForm] = useState(false);
  const [listCrop, setListCrop] = useState('Wheat (Kanak)');
  const [listVariety, setListVariety] = useState('HD-3086 Sharbati');
  const [listQty, setListQty] = useState('50');
  const [listPrice, setListPrice] = useState('2450');
  const [listMoisture, setListMoisture] = useState('11.5');
  const [listLocation, setListLocation] = useState('Samrala Farm, Field 1');

  // Soil Booking Form State
  const [selectedPkg, setSelectedPkg] = useState<SoilTestingPackage | null>(null);
  const [bookDate, setBookDate] = useState('Tomorrow');
  const [bookSlot, setBookSlot] = useState('10:00 AM - 12:00 PM');
  const [bookAddress, setBookAddress] = useState('Samrala Main Farm, Plot 14-B');

  const totalCartCount = Object.values(cartItems).reduce((sum, q) => sum + q, 0);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    await listCropForSale(
      listCrop,
      listVariety,
      parseFloat(listQty) || 10,
      parseInt(listPrice) || 2400,
      parseFloat(listMoisture) || 12.0,
      listLocation
    );
    setShowListingForm(false);
  };

  const handleBookSoil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;
    await bookSoilTest(selectedPkg, null, bookDate, bookSlot, bookAddress, 'Technician doorstep sampling');
    setSelectedPkg(null);
    alert(`Soil test booked successfully for ${selectedPkg.title}!`);
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* 1. Header with Cart Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            Kisan Market & Commerce
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            APMC rates, direct farmer trade & farm inputs
          </p>
        </div>

        {totalCartCount > 0 && (
          <button
            onClick={() => setActiveTab('buy_online')}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Cart ({totalCartCount})</span>
          </button>
        )}
      </div>

      {/* 2. Horizontal Navigation Tabs (6 Tabs) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'mandi', label: 'Mandi Rates' },
          { id: 'buy_online', label: 'Buy Inputs Online' },
          { id: 'buy_offline', label: 'Nearby Agri Stores' },
          { id: 'sell_online', label: 'Sell Online (Bids)' },
          { id: 'sell_offline', label: 'Physical Mandis' },
          { id: 'soil_test', label: 'Soil Testing Kits' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === t.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: MANDI RATES ── */}
      {activeTab === 'mandi' && (
        <div className="space-y-2">
          {marketPrices.map((m) => (
            <Card key={m.id} className="flex items-center justify-between p-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
                    {m.cropName}
                  </h4>
                  {m.isBestPrice && (
                    <Badge variant="success">Best Mandi Price</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {m.mandiName} • {m.distanceKm} km away
                </p>
                <span className="text-[11px] text-gray-400">7-Day Trend: {m.trend7Day}</span>
              </div>

              <div className="text-right">
                <span className="text-lg font-extrabold text-gray-900 dark:text-zinc-100 block">
                  ₹{m.pricePerQuintal}
                </span>
                <span className="text-[10px] text-gray-400 block">/Quintal</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  +{m.changePercent}% Today
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── TAB 2: BUY ONLINE (AGRI INPUTS) ── */}
      {activeTab === 'buy_online' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agriProducts.map((p) => {
              const qtyInCart = cartItems[p.id] || 0;
              return (
                <Card key={p.id} className="flex flex-col justify-between space-y-3">
                  <div className="flex gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="neutral">{p.brand}</Badge>
                        {p.isSubsidyEligible && <Badge variant="success">Govt Subsidized</Badge>}
                      </div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-zinc-100 truncate mt-1">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{p.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 dark:border-zinc-800">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-gray-900 dark:text-zinc-100">
                          ₹{p.price}
                        </span>
                        <span className="text-xs text-gray-400 line-through">₹{p.originalPrice}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">Delivery in {p.deliveryDays} day</span>
                    </div>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <button
                          onClick={() => updateCartQty(p.id, qtyInCart - 1)}
                          className="h-6 w-6 rounded bg-white font-bold text-gray-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          -
                        </button>
                        <span>{qtyInCart}</span>
                        <button
                          onClick={() => updateCartQty(p.id, qtyInCart + 1)}
                          className="h-6 w-6 rounded bg-white font-bold text-gray-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p.id, 1)}
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: BUY OFFLINE (NEARBY STORES) ── */}
      {activeTab === 'buy_offline' && (
        <div className="space-y-2">
          {agriShops.map((shop) => (
            <Card key={shop.id} className="space-y-2 p-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">{shop.name}</h4>
                  <p className="text-xs text-gray-500">{shop.shopType}</p>
                </div>
                <Badge variant={shop.isOpenNow ? 'success' : 'neutral'}>
                  {shop.isOpenNow ? 'Open Now' : 'Closed'}
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-zinc-300">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>{shop.address} ({shop.distanceKm} km away)</span>
              </div>

              <div className="rounded-xl bg-gray-50 p-2 text-xs dark:bg-zinc-800">
                <span className="text-[10px] font-bold text-gray-400 block mb-1">
                  CURRENT AVAILABLE STOCK:
                </span>
                <div className="flex flex-wrap gap-1">
                  {shop.availableStock.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={`tel:${shop.phone}`}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Store</span>
                </a>
                <span className="text-[11px] text-gray-400">{shop.openingHours}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── TAB 4: SELL ONLINE (FARMER LISTINGS & BUYER BIDS) ── */}
      {activeTab === 'sell_online' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
              Your Crop Listings ({cropListings.length})
            </h3>
            <button
              onClick={() => setShowListingForm(!showListingForm)}
              className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showListingForm ? 'Close' : 'List Crop for Sale'}</span>
            </button>
          </div>

          {showListingForm && (
            <Card className="border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
              <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300 mb-2">
                🌾 Create New Harvest Listing for Direct Mill/Exporter Bidding
              </h4>
              <form onSubmit={handleCreateListing} className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold">Crop Name</label>
                    <input
                      type="text"
                      value={listCrop}
                      onChange={(e) => setListCrop(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold">Variety</label>
                    <input
                      type="text"
                      value={listVariety}
                      onChange={(e) => setListVariety(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold">Quantity (Quintals)</label>
                    <input
                      type="number"
                      value={listQty}
                      onChange={(e) => setListQty(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold">Asking Price (₹/Qtl)</label>
                    <input
                      type="number"
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  Publish Listing to Verified Buyers
                </button>
              </form>
            </Card>
          )}

          {cropListings.map((l) => (
            <Card key={l.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">{l.cropName}</h4>
                  <p className="text-xs text-gray-500">
                    {l.quantityQuintals} Quintals • {l.variety} • Moisture: {l.moisturePercent}%
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    Pickup: {l.pickupLocation}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-gray-900 dark:text-zinc-100">
                    ₹{l.askingPricePerQuintal}
                  </span>
                  <Badge variant={l.status === 'Active' ? 'success' : 'neutral'}>
                    {l.status}
                  </Badge>
                </div>
              </div>

              {/* Bids received */}
              <div className="rounded-xl bg-gray-50 p-3 space-y-2 dark:bg-zinc-800">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Active Direct Buyer Bids ({buyerBids.length})
                </span>

                {buyerBids.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs shadow-xs dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700"
                  >
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100">{b.buyerName}</span>
                      <p className="text-[11px] text-gray-500">{b.pickupPromise}</p>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">
                        💳 {b.paymentTerms}
                      </span>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 block">
                        ₹{b.bidPricePerQuintal}/Qtl
                      </span>
                      <button
                        onClick={() => acceptBuyerBid(l, b)}
                        className="mt-1 rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700"
                      >
                        Accept Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── TAB 5: PHYSICAL APMC MANDIS ── */}
      {activeTab === 'sell_offline' && (
        <div className="space-y-2">
          {physicalMandis.map((m) => (
            <Card key={m.id} className="space-y-2 p-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">{m.name}</h4>
                  <p className="text-xs text-gray-500">{m.district}, {m.state} • {m.distanceKm} km</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-gray-900 dark:text-zinc-100">
                    ₹{m.modalPriceToday}
                  </span>
                  <span className="text-[10px] text-gray-400 block">Today Modal Rate</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs rounded-xl bg-gray-50 p-2 dark:bg-zinc-800">
                <div>
                  <span className="text-[10px] text-gray-400">Arrivals</span>
                  <p className="font-bold">{m.todayArrivalsQuintals} Qtl</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">Active Buyers</span>
                  <p className="font-bold">{m.activeTradersCount} Traders</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">MSP Help Counter</span>
                  <p className="font-bold text-emerald-600">Available</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-gray-400">⏰ {m.openHours}</span>
                <a href={`tel:${m.helplinePhone}`} className="font-bold text-emerald-600 hover:underline">
                  Helpline: {m.helplinePhone}
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── TAB 6: SOIL TESTING PACKAGES ── */}
      {activeTab === 'soil_test' && (
        <div className="space-y-3">
          {soilPackages.map((pkg) => (
            <Card key={pkg.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="info">{pkg.category} Test</Badge>
                    {pkg.isGovtSubsidized && <Badge variant="success">Govt Subsidized</Badge>}
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100 mt-1">
                    {pkg.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{pkg.description}</p>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="text-lg font-black text-gray-900 dark:text-zinc-100">
                    ₹{pkg.price}
                  </span>
                  <span className="text-xs text-gray-400 line-through block">₹{pkg.originalPrice}</span>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-2.5 text-xs dark:bg-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 block">PARAMETERS TESTED:</span>
                <div className="flex flex-wrap gap-1">
                  {pkg.parametersTested.map((param, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      {param}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-500">⏱️ Results in {pkg.turnaroundDays} days</span>
                <button
                  onClick={() => setSelectedPkg(pkg)}
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95"
                >
                  Book Doorstep Sample Collection
                </button>
              </div>
            </Card>
          ))}

          {/* Booking Modal */}
          {selectedPkg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-sm space-y-3 bg-white p-5 dark:bg-zinc-900">
                <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
                  Book Doorstep Soil Testing: {selectedPkg.title}
                </h3>
                <form onSubmit={handleBookSoil} className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold">Appointment Date</label>
                    <input
                      type="text"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold">Time Slot</label>
                    <select
                      value={bookSlot}
                      onChange={(e) => setBookSlot(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <option>10:00 AM - 12:00 PM</option>
                      <option>02:00 PM - 04:00 PM</option>
                      <option>04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold">Farm Address for Sampling</label>
                    <input
                      type="text"
                      value={bookAddress}
                      onChange={(e) => setBookAddress(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPkg(null)}
                      className="px-3 py-1.5 text-gray-500 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-4 py-1.5 font-bold text-white shadow-xs"
                    >
                      Confirm Booking (₹{selectedPkg.price})
                    </button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MarketScreen;
