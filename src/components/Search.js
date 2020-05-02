import React from 'react';

const Search = ({ airportSearch }) => {
	return (
		<div className='form-group mt-4'>
			<input
				id='search'
				type='text'
				className='form-control form-control-lg text-uppercase'
				placeholder='Search by Airport ICAO'
				onChange={(e) => airportSearch(e.target.value)}
				// eslint-disable-next-line no-undef
				onKeyUp={(e) => e.keyCode === 13 && search.blur()}
			/>
		</div>
	);
};

export default Search;
