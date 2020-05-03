import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import lscache from 'lscache';
import Search from './Search';
import useDebounce from './useDebounce';
import MetarReport from './MetarReport';
import Clouds from './Clouds';
import Taf from './Taf';

const token = process.env.REACT_APP_TOKEN;
const localAirport = 'EHAM';

const Metar = () => {
	const [data, setData] = useState({});
	const [airport, setAirport] = useState(localAirport);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState({ error: '', message: '' });
	const [toggleMetar, setToggleMetar] = useState(false);

	const debouncedSearchTerm = useDebounce(airport, 1000);

	const getMetar = useCallback(async () => {
		// Get cache
		let cache = lscache.get(debouncedSearchTerm.toUpperCase());
		let noCache = false;

		if (cache === null) {
			noCache = true;

			try {
				const res = await axios.get(
					`https://api.checkwx.com/metar/${debouncedSearchTerm}/decoded`,
					{
						headers: {
							'X-API-Key': `${token}`,
						},
					}
				);

				if (res.data.data.length === 0 && debouncedSearchTerm.length === 4) {
					setError({
						error: 'No Airport Found',
						message: 'Please try a different airport by ICAO, eg EGKK',
					});
					setIsLoading(false);
				} else {
					setError({ error: '', message: '' });
					setData(res.data.data[0]);
					// set cache expires 15 min
					lscache.set(
						debouncedSearchTerm.toUpperCase(),
						[res.data.data[0]],
						15
					);
					setIsLoading(false);
				}
			} catch (err) {
				setError({
					error: 'Error',
					message: 'There was an error getting the data from the server',
				});
				setData([]);
				setIsLoading(false);
			}
		} else if (
			noCache === false &&
			cache[0].icao === debouncedSearchTerm.toUpperCase()
		) {
			setData(cache[0]);
			setIsLoading(false);
		}
	}, [debouncedSearchTerm]);

	useEffect(() => {
		if (debouncedSearchTerm && debouncedSearchTerm.length === 4) {
			getMetar();
		}
	}, [debouncedSearchTerm, getMetar]);

	const cat = data.flight_category;

	return (
		<>
			<Search airportSearch={(airport) => setAirport(airport)} />

			<button
				className='btn btn-dark btn-block p-2 mt-4 mb-4'
				onClick={() => setToggleMetar(!toggleMetar)}
			>
				{toggleMetar ? 'Back To Metar' : 'To TAF'}
			</button>

			{!isLoading && error.error !== '' && (
				<div className='alert alert-danger mt-4 mb-4 p-2'>
					{error.error}. <br />
					{error.message}
				</div>
			)}
			{!toggleMetar ? (
				!isLoading &&
				error.error === '' && <MetarReport data={data} cat={cat} />
			) : (
				<Taf debouncedSearchTerm={debouncedSearchTerm} cat={cat} />
			)}

			{!toggleMetar && error.error === '' && <Clouds data={data} />}
		</>
	);
};

export default Metar;
