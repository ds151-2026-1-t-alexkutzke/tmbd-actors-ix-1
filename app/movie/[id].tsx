import { useLocalSearchParams, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, FlatList, Pressable } from 'react-native';
import { api } from '../../src/api/tmdb';

interface MovieDetails {
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  runtime: number;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export default function MovieDetailsScreen() {
  // Captura o parâmetro '[id]' do nome do arquivo
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [movieResponse, creditsResponse] = await Promise.all([
          api.get(`/movie/${id}`),
          api.get(`/movie/${id}/credits`),
        ]);

        setMovie(movieResponse.data);
        setCast(creditsResponse.data.cast.slice(0, 10));
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao carregar dados do filme');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Filme não encontrado.'}</Text>
      </View>
    );
  }

  const renderCastItem = ({ item }: { item: Cast }) => (
    <Link href={`/actor/${item.id}` as any} asChild>
      <Pressable style={styles.castCard}>
        {item.profile_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w200${item.profile_path}` }}
            style={styles.castImage}
          />
        ) : (
          <View style={styles.castImagePlaceholder}>
            <Text style={styles.placeholderText}>Sem Foto</Text>
          </View>
        )}
        <Text style={styles.castName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.castCharacter} numberOfLines={1}>
          {item.character || 'N/A'}
        </Text>
      </Pressable>
    </Link>
  );

  return (
    <ScrollView style={styles.container}>
      {movie.poster_path && (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
          style={styles.poster}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>⭐ {movie.vote_average.toFixed(1)}/10</Text>
          <Text style={styles.statText}>⏱️ {movie.runtime} min</Text>
        </View>

        <Text style={styles.sectionTitle}>Sinopse</Text>
        <Text style={styles.overview}>
          {movie.overview || 'Sinopse não disponível para este filme.'}
        </Text>

        {cast.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Elenco Principal</Text>
            <FlatList
              data={cast}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCastItem}
              horizontal
              scrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.castListContainer}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  poster: { width: '100%', height: 400 },
  content: { padding: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statText: { color: '#E50914', fontSize: 16, fontWeight: '600' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  overview: { color: '#D1D5DB', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  errorText: { color: '#FFFFFF', fontSize: 18 },

  // Estilos do elenco
  castListContainer: { paddingRight: 20 },
  castCard: {
    marginRight: 16,
    width: 120,
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    overflow: 'hidden',
  },
  castImage: { width: 120, height: 180 },
  castImagePlaceholder: {
    width: 120,
    height: 180,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#9CA3AF', fontSize: 12, textAlign: 'center' },
  castName: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', padding: 8 },
  castCharacter: { color: '#9CA3AF', fontSize: 11, paddingHorizontal: 8, paddingBottom: 8 },
});
