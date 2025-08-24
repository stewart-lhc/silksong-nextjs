import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrailerSection } from '@/components/trailer-section';

// Mock the useMediaQuery hook
jest.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: jest.fn(() => false), // Default to desktop
}));

describe('TrailerSection', () => {
  it('renders all 5 video trailers in carousel', () => {
    render(<TrailerSection />);
    
    // Check if the section title is present
    expect(screen.getByText('Experience the World of Silksong')).toBeInTheDocument();
    
    // Check if the carousel dots are present (should be 5)
    const dots = screen.getAllByLabelText(/Go to trailer \d+/);
    expect(dots).toHaveLength(5);
  });

  it('shows first trailer by default', () => {
    render(<TrailerSection />);
    
    // Check if the first trailer title is shown
    expect(screen.getByText('Hollow Knight: Silksong - Release Trailer')).toBeInTheDocument();
    expect(screen.getByText('Trailer 1 of 5')).toBeInTheDocument();
  });

  it('can navigate to next trailer', async () => {
    render(<TrailerSection />);
    
    // Click next button
    const nextButton = screen.getByLabelText('Next trailer');
    fireEvent.click(nextButton);
    
    // Should show second trailer
    await waitFor(() => {
      expect(screen.getByText("Hollow Knight: Silksong - We've Played It! | gamescom 2025")).toBeInTheDocument();
      expect(screen.getByText('Trailer 2 of 5')).toBeInTheDocument();
    });
  });

  it('can navigate to previous trailer', async () => {
    render(<TrailerSection />);
    
    // Go to second trailer first
    const nextButton = screen.getByLabelText('Next trailer');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText("Hollow Knight: Silksong - We've Played It! | gamescom 2025")).toBeInTheDocument();
    });
    
    // Then go back to first
    const prevButton = screen.getByLabelText('Previous trailer');
    fireEvent.click(prevButton);
    
    await waitFor(() => {
      expect(screen.getByText('Hollow Knight: Silksong - Release Trailer')).toBeInTheDocument();
      expect(screen.getByText('Trailer 1 of 5')).toBeInTheDocument();
    });
  });

  it('can click on dots to navigate', async () => {
    render(<TrailerSection />);
    
    // Click on third dot (index 2)
    const thirdDot = screen.getByLabelText('Go to trailer 3');
    fireEvent.click(thirdDot);
    
    // Should show third trailer
    await waitFor(() => {
      expect(screen.getByText('Hollow Knight: Silksong Reveal Trailer')).toBeInTheDocument();
      expect(screen.getByText('Trailer 3 of 5')).toBeInTheDocument();
    });
  });

  it('wraps around when navigating beyond bounds', async () => {
    render(<TrailerSection />);
    
    // Go to last trailer (5th)
    const fifthDot = screen.getByLabelText('Go to trailer 5');
    fireEvent.click(fifthDot);
    
    await waitFor(() => {
      expect(screen.getByText('Hollow Knight: Silksong - Details from Team Cherry')).toBeInTheDocument();
    });
    
    // Click next should wrap to first trailer
    const nextButton = screen.getByLabelText('Next trailer');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Hollow Knight: Silksong - Release Trailer')).toBeInTheDocument();
      expect(screen.getByText('Trailer 1 of 5')).toBeInTheDocument();
    });
  });

  it('has correct YouTube links for each trailer', () => {
    render(<TrailerSection />);
    
    // Check if YouTube link exists and updates correctly
    const youtubeLink = screen.getByText('Watch on YouTube').closest('a');
    expect(youtubeLink).toHaveAttribute('href', 'https://www.youtube.com/watch?v=6XGeJwsUP9c');
    
    // Navigate to second trailer
    const nextButton = screen.getByLabelText('Next trailer');
    fireEvent.click(nextButton);
    
    // YouTube link should update
    setTimeout(() => {
      const updatedLink = screen.getByText('Watch on YouTube').closest('a');
      expect(updatedLink).toHaveAttribute('href', 'https://www.youtube.com/watch?v=hHnI6nlfE2A');
    }, 100);
  });

  it('renders iframe with correct video embed URL', () => {
    render(<TrailerSection />);
    
    // Check if iframe is present with correct src
    const iframe = screen.getByTitle('Hollow Knight: Silksong - Release Trailer');
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/6XGeJwsUP9c');
  });
});