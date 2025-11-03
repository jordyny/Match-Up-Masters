import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../pageAnimations';
import SearchBar from '../components/SearchBar';
import SongListItem from '../components/SongListItem';
import Button from '../components/Button';
import { songs } from '../mockData';
import { FaPlus } from 'react-icons/fa';
import './NewRiffPage.css';

const NewRiffPage = () => {
  return (
    // for animations
    <motion.div
      className="page-container" 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
    <div className="page-content new-riff-page">
      <div className="top-section">
        <SearchBar />
        <h2 className="section-title">Songs</h2>
        <div className="song-list">
           {/* Map over the mock 'songs' data to create a list */}
          {songs.map((song) => (
             <Link to={`/riff/${song.id}`} key={song.id} style={{textDecoration: 'none', color: 'inherit'}}>
                <SongListItem
                    title={song.title}
                    artist={song.artist}
                    duration={song.duration}
                />
             </Link>
          ))}
        </div>
      </div>
        {/* Bottom section with a "Choose Song" button (mock) */}
      <div className="bottom-section">
        <Button to={`/riff/${songs[0].id}`}>
          Choose Song <FaPlus style={{marginLeft: '0.5rem'}} />
        </Button>
      </div>
    </div>
    </motion.div>
  );
};

export default NewRiffPage;