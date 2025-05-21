import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firestore, storage } from '../../database/firebase';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, Image as ImageIcon, Loader } from 'lucide-react';

const GalleryScreen = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const imagesQuery = query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(imagesQuery);
      const imagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate
          ? doc.data().createdAt?.toDate()
          : new Date(doc.data().createdAt),
      }));
      setImages(imagesData);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async file => {
    try {
      // Create a unique filename using timestamp and original filename
      const timestamp = Date.now();
      const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      // Create a reference to Firebase Storage
      const storageRef = ref(storage, `gallery/${filename}`);

      // Upload the file
      const uploadResult = await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);

      return {
        url: downloadURL,
        path: `gallery/${filename}`,
        filename: filename,
        contentType: file.type,
        size: file.size,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate form data
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!imageFile && !selectedImage) {
      toast.error('Please select an image');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let imageData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      // Handle image upload if there's a new file
      if (imageFile) {
        const uploadResult = await uploadImageToStorage(imageFile);

        imageData = {
          ...imageData,
          imageUrl: uploadResult.url,
          imagePath: uploadResult.path,
          imageMetadata: {
            filename: uploadResult.filename,
            contentType: uploadResult.contentType,
            size: uploadResult.size,
          },
        };

        // If updating, delete old image from storage if a new one is uploaded
        if (selectedImage?.imagePath) {
          try {
            const oldImageRef = ref(storage, selectedImage.imagePath);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error('Error deleting old image:', error);
            // Continue with update even if delete fails
          }
        }
      } else if (selectedImage) {
        // Keep existing image data if no new file is uploaded
        imageData = {
          ...imageData,
          imageUrl: selectedImage.imageUrl,
          imagePath: selectedImage.imagePath,
          imageMetadata: selectedImage.imageMetadata,
        };
      }

      if (selectedImage) {
        // Update existing document
        await updateDoc(doc(firestore, 'gallery', selectedImage.id), imageData);
        toast.success('Image updated successfully');
      } else {
        // Add new document
        imageData.createdAt = serverTimestamp();
        await addDoc(collection(firestore, 'gallery'), imageData);
        toast.success('Image added successfully');
      }

      // Reset form and state
      resetForm();
      fetchImages(); // Refresh gallery
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error(`Failed to save image: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setSelectedImage(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: [],
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleEdit = image => {
    setSelectedImage(image);
    setFormData({
      title: image.title || '',
      description: image.description || '',
      category: image.category || '',
      tags: image.tags || [],
    });
    setImagePreview(image.imageUrl);
    setShowModal(true);
  };

  const handleDelete = async image => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        // Delete image from storage
        if (image.imagePath) {
          const imageRef = ref(storage, image.imagePath);
          await deleteObject(imageRef);
        } else if (image.imageUrl) {
          // Fallback for older entries that might not have imagePath
          try {
            const imageRef = ref(storage, image.imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image using URL:', error);
            // Continue with document deletion even if storage deletion fails
          }
        }

        // Delete document from Firestore
        await deleteDoc(doc(firestore, 'gallery', image.id));
        toast.success('Image deleted successfully');
        fetchImages();
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error(`Failed to delete image: ${error.message}`);
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = tagToRemove => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Gallery Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600"
        >
          <Plus size={20} />
          Add New Image
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-gray-400">
          <ImageIcon size={48} className="mb-4 opacity-50" />
          <p className="text-xl">No images in gallery</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="mt-4 flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600"
          >
            <Plus size={16} />
            Add Your First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {images.map(image => (
            <div
              key={image.id}
              className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 transition-colors duration-200 hover:border-gray-500"
            >
              <div className="relative aspect-video">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="h-full w-full object-cover"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.png'; // You'll need to add this placeholder image to your project
                  }}
                />
                <div className="absolute right-2 top-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(image)}
                    className="rounded-lg bg-gray-800/80 p-2 text-white transition-colors duration-200 hover:bg-gray-700"
                    title="Edit image"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(image)}
                    className="rounded-lg bg-gray-800/80 p-2 text-red-500 transition-colors duration-200 hover:bg-red-500/20"
                    title="Delete image"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-lg font-semibold text-white">{image.title}</h3>
                <p className="mb-3 text-sm text-gray-300">{image.description}</p>
                <div className="flex flex-wrap gap-2">
                  {image.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-700 px-2 py-1 text-sm text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-400">
                  {image.createdAt instanceof Date
                    ? image.createdAt.toLocaleDateString()
                    : 'Unknown date'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-gray-800 p-6">
            <h2 className="mb-6 text-2xl font-bold text-white">
              {selectedImage ? 'Edit Image' : 'Add New Image'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="flex w-full items-center justify-center">
                  <label className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-700 transition-colors duration-200 hover:bg-gray-600">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pb-6 pt-5">
                        <ImageIcon className="mb-3 h-12 w-12 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG or GIF (Max 5MB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-gray-300">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                  required
                  placeholder="Enter image title"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="h-32 w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                  placeholder="Enter image description"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-300">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                  placeholder="Enter image category"
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-300">Tags</label>
                <div className="mb-2 flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                    placeholder="Add a tag"
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 rounded-full bg-gray-700 px-3 py-1 text-gray-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2 text-white transition-colors duration-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : selectedImage ? (
                    'Update Image'
                  ) : (
                    'Upload Image'
                  )}
                </button>
              </div>

              {uploading && uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="h-2.5 w-full rounded-full bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-red-500"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-right text-sm text-gray-400">{uploadProgress}%</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryScreen;
