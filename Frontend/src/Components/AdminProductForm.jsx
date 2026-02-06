import React, { useState } from "react";

const AdminProductForm = ({ onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
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
      let thumbUrl = "";
      if (file) {
        const uploadData = await uploadImage();
        imageUrl = uploadData?.url || uploadData?.path || "";
        thumbUrl = uploadData?.thumbUrl || uploadData?.thumbPath || "";
      }

      const base = import.meta.env.VITE_API_BASE_URL;
      const resp = await fetch(`${base}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          price,
          currency,
          sku,
          description,
          image: imageUrl,
          thumbnail: thumbUrl,
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
        <div className="grid grid-cols-1 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="px-3 py-2 border rounded"
            required
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            type="number"
            className="px-3 py-2 border rounded"
            required
          />
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="Currency"
            className="px-3 py-2 border rounded"
          />
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU"
            className="px-3 py-2 border rounded"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="px-3 py-2 border rounded"
            rows={3}
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
