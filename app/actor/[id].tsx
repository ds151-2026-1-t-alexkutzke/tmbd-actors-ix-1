import { useLocalSearchParams, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, FlatList, Pressable,} from 'react-native';
import { api } from '../../src/api/tmdb';

interface PersonDetails {
 name: string;
 biography: string;
 profile_path: string | null;
 birthday: string | null;
 place_of_birth: string | null;
}

interface MovieCredit {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  character: string;
}

interface MovieCreditsResponse {
  cast: MovieCredit[];
}

export default function ActorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [filmography, setFilmography] = useState<MovieCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActorData = async () => {
      try {
        setIsLoading(true);
        setError(null);

      
        const [personResponse, creditsResponse] = await Promise.all([
          api.get(`/person/${id}`),
          api.get(`/person/${id}/movie_credits`),
        ]);

        setPerson(personResponse.data);
        
        const movies = creditsResponse.data.cast
          .filter((movie: MovieCredit) => movie.poster_path)
          .sort((a: MovieCredit, b: MovieCredit) => {
            const dateA = new Date(a.release_date || '0').getTime();
            const dateB = new Date(b.release_date || '0').getTime();
            return dateB - dateA;
          });
        setFilmography(movies);
      } catch (error) {
        console.error('Erro ao buscar dados do ator:', error);
        setError('Erro ao carregar perfil do ator');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchActorData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (error || !person) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Ator não encontrado.'}</Text>
      </View>
    );
  }

  const renderFilmographyItem = ({ item }: { item: MovieCredit }) => (
    <Link href={`/movie/${item.id}`} asChild>
      <Pressable style={styles.filmCard}>
        {item.poster_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
            style={styles.filmPoster}
          />
         ) : (
          <View style={styles.filmPosterPlaceholder}>
            <Text style={styles.placeholderText}>Sem Imagem</Text>
          </View>
        )}
        <Text style={styles.filmTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.filmYear}>
          {item.release_date ? item.release_date.substring(0, 4) : 'N/A'}
        </Text>
      </Pressable>
    </Link>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Seção de Perfil */}
      <View style={styles.profileSection}>
        {person.profile_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w300${person.profile_path}` }}
            style={styles.profileImage}
          />
          ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.placeholderText}>Sem Foto</Text>
          </View>
        )}

        <View style={styles.profileInfo}>
          <Text style={styles.name}>{person.name}</Text>
          {person.birthday && (
            <Text style={styles.infoText}>📅 {person.birthday}</Text>
          )}
          {person.place_of_birth && (
            <Text style={styles.infoText}>📍 {person.place_of_birth}</Text>
          )}
        </View>
      </View>

      {/* Seção de Biografia */}
      {person.biography && person.biography.trim() !== '' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Biografia</Text>
          <Text style={styles.biography}>{person.biography}</Text>
        </View>
      )}

      {/* Seção de Filmografia */}
      {filmography.length > 0 && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Filmografia</Text>
          <FlatList
            data={filmography}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFilmographyItem}
            numColumns={2}
            columnWrapperStyle={styles.filmGrid}
            scrollEnabled={false}
          />
        </View>
      )}

      {filmography.length === 0 && (
        <View style={styles.content}>
          <Text style={styles.emptyText}>Nenhum filme encontrado para este ator.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },


 profileSection: {
    flexDirection: 'row', // Isso coloca a foto e o texto na mesma linha
    padding: 20,
    backgroundColor: '#1F1F1F',
    alignItems: 'center', // Alinha verticalmente ao centro
  },
  profileImage: { 
    width: 120, 
    height: 180, 
    borderRadius: 8, 
    marginRight: 20 // Espaço entre a foto e o texto
  },
  profileImagePlaceholder: {
    width: 120,
    height: 180,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 20
  },
  profileInfo: { 
    flex: 1, // Faz o texto ocupar o restante da tela
    gap: 8 
  },
  name: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  infoText: { color: '#9CA3AF', fontSize: 14 },


  content: { padding: 20 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  biography: { 
    color: '#D1D5DB', 
    fontSize: 15, 
    lineHeight: 24, 
    textAlign: 'justify' 
  },

  
  filmGrid: { justifyContent: 'space-between', marginBottom: 16 },
  filmCard: {
    width: '48%',
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    overflow: 'hidden',
  },
  filmPoster: { width: '100%', height: 180 },
  filmPosterPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filmTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', padding: 8 },
  filmYear: { color: '#9CA3AF', fontSize: 11, paddingHorizontal: 8, paddingBottom: 8 },

  // Estilos Gerais
  placeholderText: { color: '#9CA3AF', fontSize: 12, textAlign: 'center' },
  errorText: { color: '#FFFFFF', fontSize: 18 },
  emptyText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 20 },
});