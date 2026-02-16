import { useState } from "react";

const AdminProductForm = ({ onClose, onCreated }) => {
  const [chemicalname, setChemicalname] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [sku, setSku] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState("kg");
  const [manufacturer, setManufacturer] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [file, setFile] = useState(null);
  const [uploadData, setUploadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async (fileParam) => {
    const f = fileParam || file;
    if (!f) return null;
    const form = new FormData();
    form.append("image", f);

    const base = import.meta.env.VITE_API_BASE_URL;
    const resp = await fetch(`${base}/api/products/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || "Upload failed");
    }
    const body = await resp.json();
    return body?.data || null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let imageUrl = "";
      if (file) {
        const uploadData = await uploadImage();
        imageUrl = uploadData?.url || uploadData?.path || "";
      }

      const base = import.meta.env.VITE_API_BASE_URL;
      const resp = await fetch(`${base}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          chemicalname,
          description,
          category,
          sku,
          hsnCode,
          price,
          unit,
          quantity: 0,
          minOrderQuantity: 1,
          manufacturer,
          specifications,
          image: imageUrl,
        }),
      });

      if (!resp.ok) {
        const js = await resp.json().catch(() => ({}));
        throw new Error(js?.message || "Create failed");
      }

      onCreated && onCreated();
      onClose && onClose();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative bg-white p-6 rounded shadow w-full max-w-lg"
      >
        <h3 className="text-lg font-semibold mb-4">Add Product</h3>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <div className="grid grid-cols-1 gap-3 max-h-[70vh] overflow-y-auto px-1">
          <input
            value={chemicalname}
            onChange={(e) => setChemicalname(e.target.value)}
            placeholder="Chemical Name *"
            className="px-3 py-2 border rounded"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="px-3 py-2 border rounded"
            rows={2}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="Cement">Cement</option>
            <option value="Adhesive">Adhesive</option>
            <option value="Waterproofing">Waterproofing</option>
            <option value="Coating">Coating</option>
            <option value="Sealant">Sealant</option>
            <option value="Primer">Primer</option>
            <option value="Concrete Admixture">Concrete Admixture</option>
            <option value="Repair Material">Repair Material</option>
            <option value="Grout">Grout</option>
            <option value="Other">Other</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="SKU"
              className="px-3 py-2 border rounded"
            />
            <input
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              placeholder="HSN Code"
              className="px-3 py-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price *"
              type="number"
              step="0.01"
              className="px-3 py-2 border rounded"
              required
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="kg">kg</option>
              <option value="liter">liter</option>
              <option value="bag">bag</option>
              <option value="piece">piece</option>
              <option value="box">box</option>
              <option value="sqm">sqm</option>
              <option value="meter">meter</option>
            </select>
          </div>
          <input
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="Manufacturer/Brand"
            className="px-3 py-2 border rounded"
          />
          <textarea
            value={specifications}
            onChange={(e) => setSpecifications(e.target.value)}
            placeholder="Technical Specifications"
            className="px-3 py-2 border rounded"
            rows={2}
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                if (f) {
                  try {
                    setLoading(true);
                    const data = await uploadImage(f);
                    setUploadData(data);
                  } catch (err) {
                    setError(err.message || String(err));
                  } finally {
                    setLoading(false);
                  }
                }
              }}
            />
            {uploadData?.thumbUrl && (
              <div className="mt-2">
                <img
                  src={uploadData.thumbUrl}
                  alt="thumb"
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      // delete uploaded file
                      try {
                        const base = import.meta.env.VITE_API_BASE_URL;
                        // extract filename from path
                        const p =
                          uploadData.path ||
                          uploadData.thumbPath ||
                          uploadData.url ||
                          "";
                        const match = (p || "").split("/").pop();
                        if (match) {
                          await fetch(`${base}/api/products/upload/${match}`, {
                            method: "DELETE",
                            credentials: "include",
                          });
                        }
                      } catch {
                        // ignore
                      }
                      setUploadData(null);
                      setFile(null);
                    }}
                    className="text-sm text-red-600 mt-2"
                  >
                    Delete Uploaded Image
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-4 py-2 rounded text-white"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
