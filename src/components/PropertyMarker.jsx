<Popup className="text-sm">
  <div>
    <PropertyMarker listing={listing} setSelectedListing={setSelectedListing} />
    <strong>{listing.title}</strong><br />
    {listing.city}<br />
    €{listing.price}<br />
    <button
      onClick={() => setSelectedListing(listing)}
      className="text-blue-600 underline mt-1"
    >
      {t('viewMore', { ns: 'listing' })}
    </button>
  </div>
</Popup>
