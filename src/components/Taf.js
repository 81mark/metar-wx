import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import lscache from 'lscache';
import TafReport from './TafReport';

const token = process.env.REACT_APP_TOKEN;

const Taf = ({ cat, debouncedSearchTerm }) => {
	const [taf, setTaf] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState({ error: '', message: '' });

	const getTaf = useCallback(async () => {
		// Get cache
		let cache = lscache.get('TAF-' + debouncedSearchTerm.toUpperCase());
		let noCache = false;

		if (cache === null) {
			noCache = true;

			try {
				const res = await axios.get(
					`https://api.checkwx.com/taf/${debouncedSearchTerm}/decoded`,
					{
						headers: {
							'X-API-Key': `${token}`,
						},
					}
				);

				if (res.data.data.length === 0 && debouncedSearchTerm.length === 4) {
					setError({
						error: 'No TAF or Airport Found',
						message: 'Please try a different airport by ICAO, eg EGKK',
					});
					setIsLoading(false);
				} else {
					setError({ error: '', message: '' });
					setTaf(res.data.data[0]);
					// set cache expires 15 min
					lscache.set(
						'TAF-' + debouncedSearchTerm.toUpperCase(),
						[res.data.data[0]],
						15
					);
					setIsLoading(false);
				}
			} catch (err) {
				setError({
					error: 'Error',
					message: 'There was an error getting the TAF data from the server',
				});
				console.log('error1: ', err);
				console.log('error2: ', error.error);
				setIsLoading(false);
			}
		} else if (
			noCache === false &&
			'TAF-' + cache[0].icao === 'TAF-' + debouncedSearchTerm.toUpperCase()
		) {
			setTaf(cache[0]);
			setIsLoading(false);
		}
	}, [debouncedSearchTerm, error.error]);

	useEffect(() => {
		if (debouncedSearchTerm && debouncedSearchTerm.length === 4) {
			getTaf();
		}
	}, [debouncedSearchTerm, getTaf]);

	return (
		<>
			{!isLoading && error.error !== '' && (
				<div className='alert alert-danger mt-4 mb-4 p-2'>
					{error.error}. <br />
					{error.message}
				</div>
			)}
			{!isLoading && error.error === '' && <TafReport taf={taf} cat={cat} />}
		</>
	);
};

export default Taf;
