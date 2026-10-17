'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Phone,
  Search,
  CheckCheck,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card, Badge } from '@/components/ui/Card';
import { SoilTestingPackage } from '@/lib/types';

export function MarketScreen() {
  const {
    marketPrices,
    agriProducts,
    cartItems,
    addToCart,
    updateCartQty,
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
  const [mandiSearch, setMandiSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');

  // Sell Online Form State
  const [listCrop, setListCrop] = useState('Wheat (Kanak)');
  const [listVariety, setListVariety] = useState('Pusa Gautami');
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
  };

  const handleBookSoil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;
    await bookSoilTest(selectedPkg, null, bookDate, bookSlot, bookAddress, 'Technician doorstep sampling');
    setSelectedPkg(null);
    alert(`Soil test booked successfully for ${selectedPkg.title}! Technicians will collect sample.`);
  };

  const filteredMandiPrices = marketPrices.filter(
    (m) =>
      m.cropName.toLowerCase().includes(mandiSearch.toLowerCase()) ||
      m.mandiName.toLowerCase().includes(mandiSearch.toLowerCase())
  );

  const filteredProducts = agriProducts.filter(
    (p) => productCategoryFilter === 'ALL' || p.category === productCategoryFilter
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">
            Mandi & Market
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time APMC prices, certified farm inputs, direct buyer bidding, and soil lab testing
          </p>
        </div>

        {totalCartCount > 0 && (
          <button
            onClick={() => setActiveTab('buy_online')}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Shopping Cart ({totalCartCount})</span>
          </button>
        )}
      </div>

      {/* 2. Minimal Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'mandi', label: 'Live Mandi Rates' },
          { id: 'buy_online', label: 'Buy Inputs' },
          { id: 'buy_offline', label: 'Nearby Dealers' },
          { id: 'sell_online', label: 'Direct Bidding' },
          { id: 'sell_offline', label: 'Physical Mandis' },
          { id: 'soil_test', label: 'Soil Testing Labs' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
              activeTab === t.id
                ? 'bg-zinc-100 border border-zinc-300 text-zinc-900 font-semibold shadow-2xs'
                : 'border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: MANDI RATES (DATA TABLE) ── */}
      {activeTab === 'mandi' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={mandiSearch}
                onChange={(e) => setMandiSearch(e.target.value)}
                placeholder="Filter by commodity or mandi..."
                className="w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-300"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-medium text-emerald-700">● 14 Mandis Active</span>
              <span>·</span>
              <span>Updated 15 mins ago</span>
            </div>
          </div>

          <Card className="overflow-hidden p-0 border border-zinc-200/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[11px] font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Commodity</th>
                    <th className="py-2.5 px-4">APMC Mandi</th>
                    <th className="py-2.5 px-4">Distance</th>
                    <th className="py-2.5 px-4 text-right">Modal Price (₹/Qtl)</th>
                    <th className="py-2.5 px-4 text-right">MSP Reference</th>
                    <th className="py-2.5 px-4 text-right">24h Gain</th>
                    <th className="py-2.5 px-4 text-center">Trend (7d)</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredMandiPrices.map((m) => {
                    const isMspAbove = m.pricePerQuintal >= 2400;
                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-emerald-50/50 hover:translate-x-0.5 transition-all duration-200 cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-medium text-zinc-900 group-hover:text-emerald-900 transition-colors">
                          <div className="flex items-center gap-2">
                            <span>{m.cropName}</span>
                            {m.isBestPrice && (
                              <Badge variant="success">Best Price</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-700 font-medium">
                          {m.mandiName}
                        </td>
                        <td className="py-3 px-4 text-zinc-400">
                          {m.distanceKm} km
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-zinc-900 text-sm">
                          ₹{m.pricePerQuintal.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-500">
                          ₹2,275
                          <span className={`text-[10px] ml-1 font-medium ${isMspAbove ? 'text-emerald-700' : 'text-amber-700'}`}>
                            ({isMspAbove ? '+Above MSP' : 'Near MSP'})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-700">
                          +{m.changePercent}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded transition-transform group-hover:scale-105">
                            <TrendingUp className="h-3 w-3" />
                            {m.trend7Day}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setActiveTab('sell_online');
                              setListCrop(m.cropName);
                              setListPrice(m.pricePerQuintal.toString());
                            }}
                            className="rounded-lg border border-zinc-200 bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 hover:scale-105 active:scale-95 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-all duration-200 cursor-pointer shadow-2xs"
                          >
                            Sell Here
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 2: BUY ONLINE (PRODUCT CATALOG) ── */}
      {activeTab === 'buy_online' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {['ALL', 'Fertilizer', 'Seeds', 'Pesticide', 'Bio-Stimulant'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setProductCategoryFilter(cat)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    productCategoryFilter === cat
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-xs text-zinc-400">
              {filteredProducts.length} verified products
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const qtyInCart = cartItems[p.id] || 0;
              return (
                <Card
                  key={p.id}
                  className="flex flex-col justify-between space-y-3 p-4 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.99] transition-all duration-250 group cursor-pointer"
                >
                  <div className="space-y-2.5">
                    <div className="h-36 w-full overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {p.isSubsidyEligible && (
                        <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
                          Govt Subsidized
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 text-[11px]">{p.brand}</span>
                        <span className="text-zinc-500 text-[11px]">
                          Delivery {p.deliveryDays}d
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs text-zinc-900 group-hover:text-emerald-900 transition-colors line-clamp-1 mt-0.5">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">{p.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 pt-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-zinc-900">
                          ₹{p.price}
                        </span>
                        <span className="text-xs text-zinc-400 line-through">₹{p.originalPrice}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">Pack: {p.packSizes?.[0] || p.packSize || '1 Unit'}</span>
                    </div>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-800">
                        <button
                          onClick={() => updateCartQty(p.id, qtyInCart - 1)}
                          className="h-4 w-4 rounded hover:bg-zinc-200 flex items-center justify-center active:scale-90 transition-transform"
                        >
                          -
                        </button>
                        <span>{qtyInCart}</span>
                        <button
                          onClick={() => updateCartQty(p.id, qtyInCart + 1)}
                          className="h-4 w-4 rounded hover:bg-zinc-200 flex items-center justify-center active:scale-90 transition-transform"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p.id, 1)}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95 px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 cursor-pointer shadow-xs"
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

      {/* ── TAB 3: BUY OFFLINE (NEARBY AGRI STORES) ── */}
      {activeTab === 'buy_offline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Verified Krishi Vigyan Kendras & Dealers
            </span>
            <span className="text-xs text-zinc-400">Within 15 km Radius</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agriShops.map((s) => (
              <Card key={s.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-zinc-900">
                      {s.name || s.shopName}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{s.address}</p>
                    <span className="text-[11px] text-zinc-600 block mt-1">
                      {s.distanceKm} km away · {s.openingHours || s.openHours}
                    </span>
                  </div>
                  <Badge variant="neutral">
                    ★ {s.rating}
                  </Badge>
                </div>

                <div className="border-t border-zinc-100 pt-2 flex items-center justify-between">
                  <a
                    href={`tel:${s.phone || s.phoneNumber}`}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{s.phone || s.phoneNumber}</span>
                  </a>
                  <button className="rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    Get Directions
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: SELL ONLINE (DIRECT BIDDING) ── */}
      {activeTab === 'sell_online' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 Cols): Form & My Active Listings */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-xs text-zinc-900">
                  Post Crop Listing for Buyer Bids
                </h3>
                <p className="text-xs text-zinc-500">Sell directly to mills & corporate procurement tenders</p>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-zinc-700">Commodity</label>
                  <input
                    type="text"
                    required
                    value={listCrop}
                    onChange={(e) => setListCrop(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-zinc-700">Variety</label>
                    <input
                      type="text"
                      required
                      value={listVariety}
                      onChange={(e) => setListVariety(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-zinc-700">Quantity (Quintals)</label>
                    <input
                      type="number"
                      required
                      value={listQty}
                      onChange={(e) => setListQty(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-zinc-700">Asking Price (₹/Qtl)</label>
                    <input
                      type="number"
                      required
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-zinc-700">Moisture Content (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={listMoisture}
                      onChange={(e) => setListMoisture(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-zinc-700">Farm Pickup Location</label>
                  <input
                    type="text"
                    required
                    value={listLocation}
                    onChange={(e) => setListLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-medium text-white transition-colors mt-2"
                >
                  Publish Listing to Buyers
                </button>
              </form>
            </Card>

            {/* My Active Listings */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                Active Listings ({cropListings.length})
              </span>
              {cropListings.map((l) => (
                <Card key={l.id} className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-zinc-900">
                      {l.cropName} ({l.variety})
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      ₹{l.askingPricePerQuintal}/Qtl
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Quantity: {l.quantityQuintals} Qtl · Moisture: {l.moisturePercentage ?? l.moisturePercent}%
                  </p>
                  <Badge variant="neutral">
                    {l.status} · {l.offersReceivedCount ?? l.activeBidsCount ?? 0} Bids Received
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column (7 Cols): Active Buyer Bids */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-zinc-900">
                Live Corporate Bids & Buyer Tenders
              </h3>
              <p className="text-xs text-zinc-500">
                Verified buyer contracts with direct bank transfer and farmgate pickup
              </p>
            </div>

            <div className="space-y-3">
              {buyerBids.map((b) => (
                <Card key={b.id} className="p-4 space-y-3 hover:border-zinc-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-zinc-900">
                          {b.buyerName}
                        </span>
                        <Badge variant="success">Verified</Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Bid for {b.quantityDemandedQuintals ?? 20} Quintals · Farmgate Pickup Included
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-zinc-900">
                        ₹{b.offeredPricePerQuintal ?? b.bidPricePerQuintal}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">/Quintal</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                    <span>Payment: <strong>Direct DBT</strong></span>
                    <button
                      onClick={() => acceptBuyerBid(b.id)}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white transition-colors"
                    >
                      Accept Contract
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: PHYSICAL MANDIS DIRECTORY ── */}
      {activeTab === 'sell_offline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Government Regulated Mandis
            </span>
            <span className="text-xs text-zinc-400">Direct Delivery Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {physicalMandis.map((pm) => (
              <Card key={pm.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-zinc-900">
                      {pm.name || pm.mandiName}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{pm.district}, {pm.state}</p>
                    <span className="text-xs font-semibold text-zinc-800 block mt-1">
                      Today&apos;s Modal Price: ₹{pm.currentModalPrice ?? pm.modalPriceToday}/Qtl
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {pm.distanceKm} km away
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs bg-zinc-50 border border-zinc-100 p-2 rounded-lg">
                  <div>
                    <span className="text-[10px] text-zinc-400">Today&apos;s Arrivals</span>
                    <p className="font-bold text-zinc-900">{pm.todayArrivalQuintals ?? pm.todayArrivalsQuintals} Qtl</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400">Active Traders</span>
                    <p className="font-bold text-emerald-700">{pm.activeTradersCount} Buyers</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
                  <span className="text-zinc-400">Helpline: {pm.helplineNumber ?? pm.helplinePhone}</span>
                  <a
                    href={`tel:${pm.helplineNumber ?? pm.helplinePhone}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    Call Secretary
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: SOIL TESTING PACKAGES ── */}
      {activeTab === 'soil_test' && (
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-sm text-zinc-900">
              Government Accredited Soil Testing Laboratory Packages
            </h3>
            <p className="text-xs text-zinc-500">
              Book doorstep soil sampling technicians. Digital Soil Health Card generated within 48-72 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {soilPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className="flex flex-col justify-between p-5 space-y-4 hover:border-zinc-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={pkg.isGovtSubsidized ? 'success' : 'neutral'}>
                      {pkg.isGovtSubsidized ? '50% Govt Subsidy' : 'Certified Lab'}
                    </Badge>
                    <span className="text-xs text-zinc-400">Turnaround: {pkg.turnaroundDays}d</span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-zinc-900">
                      {pkg.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1">{pkg.description}</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-zinc-900">
                      ₹{pkg.price}
                    </span>
                    <span className="text-xs text-zinc-400 line-through">₹{pkg.originalPrice}</span>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-zinc-100">
                    <span className="text-[11px] font-medium text-zinc-700 block">
                      Parameters Tested:
                    </span>
                    {pkg.parametersTested.map((param, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <CheckCheck className="h-3 w-3 text-emerald-600" />
                        <span>{param}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPkg(pkg)}
                  className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-medium text-white transition-colors"
                >
                  Book Doorstep Sampling (₹{pkg.price})
                </button>
              </Card>
            ))}
          </div>

          {/* Booking Modal */}
          {selectedPkg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
              <Card className="max-w-md w-full p-5 space-y-3 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900">
                      Book {selectedPkg.title}
                    </h3>
                    <p className="text-xs text-emerald-700 font-medium">Price: ₹{selectedPkg.price}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPkg(null)}
                    className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleBookSoil} className="space-y-3 text-xs">
                  <div>
                    <label className="font-medium text-zinc-700">Preferred Sampling Date</label>
                    <input
                      type="text"
                      required
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-zinc-700">Time Slot</label>
                    <input
                      type="text"
                      required
                      value={bookSlot}
                      onChange={(e) => setBookSlot(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-zinc-700">Farm Address / Plot Number</label>
                    <input
                      type="text"
                      required
                      value={bookAddress}
                      onChange={(e) => setBookAddress(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 outline-none focus:bg-white focus:border-zinc-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPkg(null)}
                      className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-medium text-white transition-colors"
                    >
                      Confirm Booking
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
