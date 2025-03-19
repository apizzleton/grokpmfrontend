import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Grid,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { API_ENDPOINT } from '../config/api';

const PhotoUpload = ({ 
  entityType, // 'property' or 'unit'
  entityId,
  photos = [],
  onPhotosChange,
  maxPhotos = 5,
  allowMainPhoto = false
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    
    if (photos.length + files.length > maxPhotos) {
      enqueueSnackbar(`You can upload a maximum of ${maxPhotos} photos`, { variant: 'warning' });
      return;
    }

    setUploading(true);
    
    try {
      const newPhotos = await Promise.all(
        files.map(async (file) => {
          // Check file size (limit to 5MB)
          if (file.size > 5 * 1024 * 1024) {
            enqueueSnackbar(`File ${file.name} exceeds 5MB limit`, { variant: 'error' });
            return null;
          }
          
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                // Create a photo object to send to the backend
                const photoData = {
                  [entityType === 'property' ? 'property_id' : 'unit_id']: entityId,
                  name: file.name,
                  url: reader.result,
                  is_main: photos.length === 0 && allowMainPhoto // Make first photo the main one by default
                };
                
                // In a production environment, we would upload to server
                // For now, we'll just use the base64 data
                resolve(photoData);
              } catch (error) {
                console.error('Error processing photo:', error);
                enqueueSnackbar(`Error processing ${file.name}`, { variant: 'error' });
                resolve(null);
              }
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const validNewPhotos = newPhotos.filter(photo => photo !== null);
      
      if (validNewPhotos.length > 0) {
        // If this is the first photo and main photo is allowed, set it as main
        const updatedPhotos = [...photos, ...validNewPhotos];
        
        // If we allow main photo and none is set as main, set the first one
        if (allowMainPhoto && !updatedPhotos.some(p => p.is_main)) {
          updatedPhotos[0].is_main = true;
        }
        
        onPhotosChange(updatedPhotos);
        enqueueSnackbar(`${validNewPhotos.length} photo(s) uploaded successfully`, { variant: 'success' });
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      enqueueSnackbar('Failed to upload photos', { variant: 'error' });
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const handleDeletePhoto = (photoId) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    
    // If we deleted the main photo and we have other photos, make the first one main
    if (allowMainPhoto && photos.find(p => p.id === photoId)?.is_main && updatedPhotos.length > 0) {
      updatedPhotos[0].is_main = true;
    }
    
    onPhotosChange(updatedPhotos);
    enqueueSnackbar('Photo deleted', { variant: 'success' });
  };

  const handleSetMainPhoto = (photoId) => {
    if (!allowMainPhoto) return;
    
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      is_main: photo.id === photoId
    }));
    
    onPhotosChange(updatedPhotos);
    enqueueSnackbar('Main photo updated', { variant: 'success' });
  };

  const handlePreviewPhoto = (photo) => {
    setPreviewPhoto(photo);
    setPreviewOpen(true);
  };

  return (
    <Box sx={{ my: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Photos {photos.length > 0 && `(${photos.length}/${maxPhotos})`}
        </Typography>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          disabled={uploading || photos.length >= maxPhotos}
        >
          Upload Photo
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileChange}
            disabled={uploading || photos.length >= maxPhotos}
          />
        </Button>
      </Box>

      {uploading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {photos.length === 0 ? (
        <Paper 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            backgroundColor: 'background.default',
            border: '1px dashed grey'
          }}
        >
          <Typography color="text.secondary">
            No photos uploaded yet
          </Typography>
          <Button
            component="label"
            sx={{ mt: 1 }}
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
          >
            Upload Photo
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileChange}
              disabled={uploading}
            />
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {photos.map((photo) => (
            <Grid item xs={6} sm={4} md={3} key={photo.id}>
              <Paper 
                elevation={3}
                sx={{ 
                  position: 'relative',
                  height: 150,
                  overflow: 'hidden',
                  '&:hover .photo-actions': {
                    opacity: 1
                  }
                }}
              >
                <Box
                  component="img"
                  src={photo.url}
                  alt={photo.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => handlePreviewPhoto(photo)}
                />
                
                {photo.is_main && allowMainPhoto && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Main
                  </Box>
                )}
                
                <Box 
                  className="photo-actions"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1,
                    opacity: 0,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {allowMainPhoto && (
                    <IconButton 
                      size="small" 
                      onClick={() => handleSetMainPhoto(photo.id)}
                      color={photo.is_main ? 'primary' : 'default'}
                      disabled={photo.is_main}
                      sx={{ color: 'white' }}
                    >
                      {photo.is_main ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  )}
                  
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeletePhoto(photo.id)}
                    sx={{ color: 'white' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewPhoto?.name}
          {previewPhoto?.is_main && allowMainPhoto && (
            <Box component="span" sx={{ ml: 1, color: 'primary.main' }}>
              (Main Photo)
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {previewPhoto && (
            <Box
              component="img"
              src={previewPhoto.url}
              alt={previewPhoto.name}
              sx={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {allowMainPhoto && previewPhoto && !previewPhoto.is_main && (
            <Button 
              onClick={() => {
                handleSetMainPhoto(previewPhoto.id);
                setPreviewOpen(false);
              }}
              startIcon={<StarBorderIcon />}
            >
              Set as Main
            </Button>
          )}
          <Button 
            onClick={() => {
              if (previewPhoto) {
                handleDeletePhoto(previewPhoto.id);
              }
              setPreviewOpen(false);
            }}
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PhotoUpload;
