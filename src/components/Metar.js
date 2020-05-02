import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import Search from './Search';
import useDebounce from './useDebounce';
import Clouds from './Clouds';
import Taf from './Taf';
import lscache from 'lscache';

const token = process.env.REACT_APP_TOKEN;
const localAirport = 'EHAM';
// const currentTime = new Date().getTime();

const Metar = () => {
	const [data, setData] = useState({});
	const [airport, setAirport] = useState(localAirport);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState({ error: '', message: '' });
	const [toggleMetar, setToggleMetar] = useState(false);

	const debouncedSearchTerm = useDebounce(airport, 1000);
	// No lscache here it runs 6 times

	const getMetar = useCallback(async () => {
		// Here we can put lscache GET runs once
		let cache = lscache.get(debouncedSearchTerm.toUpperCase());
		let noCache = false;

		// console.log('cache before IF: ', cache);
		// console.log('debounce before IF: ', debouncedSearchTerm);
		if (cache === null) {
			noCache = true;
			// console.log('noCache: ', noCache);
			// console.log('details: ', cache);

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
					error: `Error, ${err.response.data.error} (${err.response.status})`,
					message: 'There was an error getting the data from the server',
				});
				setData([]);
				setIsLoading(false);
			}
		} else if (
			noCache === false &&
			cache[0].icao === debouncedSearchTerm.toUpperCase()
		) {
			// console.log('This is from the cache');
			// console.log('test', cache[0]);
			setData(cache[0]);
			setIsLoading(false);
		}
	}, [debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (debouncedSearchTerm && debouncedSearchTerm.length === 4) {
			getMetar();
		}
	}, [debouncedSearchTerm, getMetar]); // eslint-disable-line react-hooks/exhaustive-deps

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
				error.error === '' && (
					<div
						className={
							(data.flight_category === 'VFR' &&
								'card text-white bg-success mb-3') ||
							(data.flight_category === 'MVFR' &&
								'card text-white bg-primary mb-3') ||
							(data.flight_category === 'IFR' &&
								'card text-white bg-danger mb-3') ||
							(data.flight_category === 'LIFR' &&
								'card text-white bg-info mb-3')
						}
					>
						<div className='card-body'>
							<h4 className='card-title'>
								{data.icao} <strong>{data.flight_category}</strong>
								<span className='taf-link small text-uppercase float-right'></span>
								<span className='float-right'> Metar</span>
							</h4>
							<p className='card-text'>
								{data.station.name} Airport
								<br />
								Airfield Elevation: {data.elevation.feet} feet
							</p>
							<p>Visibility: {data.visibility.meters} meters</p>
							<p>Pressure: {data.barometer.hpa} Hpa</p>
							<hr />
							{!data.wind ? (
								<p>No Wind</p>
							) : (
								<>
									<p>
										Wind is {data.wind.degrees}&deg; at {data.wind.speed_kts}{' '}
										kts
									</p>
								</>
							)}
							<hr />
							<h3 className='text-center'>Temperature</h3>
							<h4 className='text-center'>{data.temperature.celsius}&deg;c</h4>
							<h3 className='text-center'>Dewpoint</h3>
							<h4 className='text-center'>{data.dewpoint.celsius}&deg;c</h4>
						</div>
						<div className='card-footer text-dark small font-weight-bold'>
							Observed at
							{moment(new Date(data.observed)).format(' h:mm:a on DD/MM/YYYY')}
						</div>
					</div>
				)
			) : (
				<Taf
					debouncedSearchTerm={debouncedSearchTerm}
					cat={data.flight_category}
				/>
			)}

			{!toggleMetar && error.error === '' && <Clouds data={data} />}
		</>
	);
};

export default Metar;
